'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/get-session';
import { createClient } from '@/lib/supabase/server';
import type { CategoryInput, MenuItemInput } from '@menuos/shared';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadMenuItemPhoto(formData: FormData) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Archivo inválido.' };
  if (!ALLOWED_MIME.has(file.type)) return { error: 'Solo se permiten imágenes (JPG, PNG, WebP, GIF, AVIF).' };
  if (file.size > MAX_BYTES) return { error: 'La imagen no puede superar 5 MB.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${org.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('menu-photos')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: 'Error al subir la imagen. Verifica que el bucket "menu-photos" existe.' };

  const { data: { publicUrl } } = supabase.storage.from('menu-photos').getPublicUrl(path);

  return { url: publicUrl };
}

// ============================================================
// CATEGORIES
// ============================================================

export async function createCategory(data: CategoryInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { count } = await supabase
    .from('menu_categories')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .is('deleted_at', null);

  const { error } = await supabase.from('menu_categories').insert({
    organization_id: org.id,
    name: data.name,
    icon: data.icon ?? null,
    color: data.color ?? null,
    is_visible: data.is_visible,
    sort_order: count ?? 0,
  });

  if (error) return { error: 'Error al crear la categoría.' };

  revalidatePath('/menu');
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_categories')
    .update({
      ...(data.name !== undefined ? { name: data.name } : {}),
      icon: data.icon ?? null,
      color: data.color ?? null,
      ...(data.is_visible !== undefined ? { is_visible: data.is_visible } : {}),
    })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al actualizar la categoría.' };

  revalidatePath('/menu');
}

export async function deleteCategory(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al eliminar la categoría.' };

  revalidatePath('/menu');
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_categories')
    .update({ is_visible: isVisible })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar visibilidad.' };

  revalidatePath('/menu');
}

export async function reorderCategories(orderedIds: string[]) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('menu_categories')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('organization_id', org.id),
  );

  await Promise.all(updates);
  revalidatePath('/menu');
}

// ============================================================
// MENU ITEMS
// ============================================================

export async function createMenuItem(data: MenuItemInput) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { count } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', data.category_id)
    .is('deleted_at', null);

  const { error } = await supabase.from('menu_items').insert({
    organization_id: org.id,
    category_id: data.category_id,
    name: data.name,
    description: data.description ?? null,
    base_price: data.base_price,
    photo_url: data.photo_url || null,
    is_available: data.is_available,
    is_special: data.is_special,
    is_vegetarian: data.is_vegetarian ?? false,
    is_gluten_free: data.is_gluten_free ?? false,
    is_spicy: data.is_spicy ?? false,
    preparation_time_minutes: data.preparation_time_minutes ?? null,
    sort_order: count ?? 0,
  });

  if (error) return { error: 'Error al crear el platillo.' };

  revalidatePath('/menu');
}

export async function updateMenuItem(id: string, data: Partial<MenuItemInput>) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_items')
    .update({
      ...(data.name !== undefined ? { name: data.name } : {}),
      description: data.description ?? null,
      photo_url: data.photo_url || null,
      ...(data.base_price !== undefined ? { base_price: data.base_price } : {}),
      ...(data.category_id !== undefined ? { category_id: data.category_id } : {}),
      ...(data.is_available !== undefined ? { is_available: data.is_available } : {}),
      ...(data.is_special !== undefined ? { is_special: data.is_special } : {}),
      ...(data.is_vegetarian !== undefined ? { is_vegetarian: data.is_vegetarian } : {}),
      ...(data.is_gluten_free !== undefined ? { is_gluten_free: data.is_gluten_free } : {}),
      ...(data.is_spicy !== undefined ? { is_spicy: data.is_spicy } : {}),
      preparation_time_minutes: data.preparation_time_minutes ?? null,
    })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al actualizar el platillo.' };

  revalidatePath('/menu');
}

export async function deleteMenuItem(id: string) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al eliminar el platillo.' };

  revalidatePath('/menu');
}

export async function toggleMenuItemAvailable(id: string, isAvailable: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar disponibilidad.' };

  revalidatePath('/menu');
}

export async function toggleMenuItemSoldOut(id: string, isSoldOut: boolean) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_items')
    .update({ is_sold_out_today: isSoldOut })
    .eq('id', id)
    .eq('organization_id', org.id);

  if (error) return { error: 'Error al cambiar estado.' };

  revalidatePath('/menu');
}

export async function reorderMenuItems(orderedIds: string[]) {
  const { org } = await requireAdminSession();
  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('menu_items')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('organization_id', org.id),
  );

  await Promise.all(updates);
  revalidatePath('/menu');
}
