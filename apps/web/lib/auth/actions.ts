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
  // Use admin client to create the user, bypassing the SMTP email confirmation
  // requirement. Restaurant owners are trusted signers — email can be verified
  // separately via the forgot-password flow once SMTP is stable.
  const admin = createAdminClient();

  const { data: authData, error: createError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (createError || !authData.user) {
    return { error: createError?.message ?? 'Error al crear la cuenta.' };
  }

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

  // Sign in the newly created user to establish a session
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (signInError) {
    return { error: 'Cuenta creada. Inicia sesión para continuar.' };
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
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/auth/reset-password`,
  });

  if (error) {
    return { error: 'Error al enviar el correo de recuperación.' };
  }

  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'Error al actualizar la contraseña.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
