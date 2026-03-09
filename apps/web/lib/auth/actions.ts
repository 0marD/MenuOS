'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@menuos/shared/validations';
import { generateSlug } from '@menuos/shared/utils';

export async function login(formData: LoginInput): Promise<{ error?: string } | never> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Datos inválidos' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: 'Email o contraseña incorrectos' };

  revalidatePath('/', 'layout');
  redirect('/admin/dashboard');
}

export async function register(formData: RegisterInput): Promise<{ error?: string } | never> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) return { error: 'Datos inválidos' };

  const supabase = await createClient();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signUpError) {
    if (signUpError.message.includes('already')) {
      return { error: 'Este email ya está registrado' };
    }
    return { error: signUpError.message };
  }

  if (!authData.user) return { error: 'Error al crear la cuenta' };

  const slug = generateSlug(parsed.data.orgName);

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.orgName,
      slug,
      plan: 'starter',
      subscription_status: 'trialing',
    })
    .select()
    .single();

  if (orgError) return { error: 'Error al crear la organización' };

  await supabase.from('staff_users').insert({
    organization_id: org.id,
    auth_user_id: authData.user.id,
    name: parsed.data.name,
    email: parsed.data.email,
    role: 'super_admin',
  });

  revalidatePath('/', 'layout');
  redirect('/admin/dashboard');
}

export async function logout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
