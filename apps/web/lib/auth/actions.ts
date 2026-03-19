'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { generateSlug } from '@menuos/shared';
import type { LoginInput, RegisterInput } from '@menuos/shared';

export async function login(data: LoginInput) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(data: RegisterInput) {
  const supabase = await createClient();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError || !authData.user) {
    return { error: signUpError?.message ?? 'Error al crear la cuenta.' };
  }

  // Use admin client to bypass RLS: the new user has no staff_users record yet,
  // so auth_org_id() returns NULL and all RLS policies would block the inserts.
  const admin = createAdminClient();
  const slug = generateSlug(data.restaurantName);

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: data.restaurantName,
      slug,
    })
    .select()
    .single();

  if (orgError || !org) {
    return { error: orgError?.message ?? 'Error al crear el restaurante. Intenta de nuevo.' };
  }

  const { error: staffError } = await admin.from('staff_users').insert({
    auth_id: authData.user.id,
    organization_id: org.id,
    name: data.name,
    email: data.email,
    role: 'super_admin',
    branch_ids: [],
  });

  if (staffError) {
    return { error: staffError.message ?? 'Error al configurar el perfil.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function sendPasswordReset(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: 'Error al enviar el correo de recuperación.' };
  }

  return { success: true };
}
