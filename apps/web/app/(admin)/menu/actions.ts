'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { menuCategorySchema, menuItemSchema, type MenuCategoryInput, type MenuItemInput } from '@menuos/shared/validations';
import type { Tables, TablesInsert, TablesUpdate } from '@menuos/database/types';

export async function createCategory(data: MenuCategoryInput): Promise<{ data?: Tables<'menu_categories'>; error?: string }> {
  const parsed = menuCategorySchema.safeParse(data);
  if (!parsed.success) return { error: 'Datos inválidos' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { data: orgData } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!orgData) return { error: 'Organización no encontrada' };

  const insert: TablesInsert<'menu_categories'> = {
    organization_id: orgData.organization_id,
    name: parsed.data.name,
    icon: parsed.data.icon ?? null,
    color: parsed.data.color ?? null,
    sort_order: parsed.data.sort_order,
    is_visible: parsed.data.is_visible,
  };

  const { data: category, error } = await supabase
    .from('menu_categories')
    .insert(insert)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/menu');
  return { data: category };
}

export async function updateCategory(id: string, data: MenuCategoryInput): Promise<{ data?: Tables<'menu_categories'>; error?: string }> {
  const parsed = menuCategorySchema.safeParse(data);
  if (!parsed.success) return { error: 'Datos inválidos' };

  const update: TablesUpdate<'menu_categories'> = {
    name: parsed.data.name,
    icon: parsed.data.icon ?? null,
    color: parsed.data.color ?? null,
    sort_order: parsed.data.sort_order,
    is_visible: parsed.data.is_visible,
  };

  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from('menu_categories')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/menu');
  return { data: category };
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('menu_categories')
    .update({ is_visible: isVisible })
    .eq('id', id);

  revalidatePath('/admin/menu');
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('menu_categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/menu');
}

export async function createItem(categoryId: string, data: MenuItemInput): Promise<{ data?: Tables<'menu_items'>; error?: string }> {
  const parsed = menuItemSchema.safeParse(data);
  if (!parsed.success) return { error: 'Datos inválidos' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { data: orgData } = await supabase
    .from('staff_users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!orgData) return { error: 'Organización no encontrada' };

  const { filters, ...formData } = parsed.data;

  const insert: TablesInsert<'menu_items'> = {
    organization_id: orgData.organization_id,
    category_id: categoryId,
    name: formData.name,
    description: formData.description ?? null,
    price: formData.price,
    is_available: formData.is_available,
    is_sold_out_today: formData.is_sold_out_today,
    prep_time: formData.prep_time ?? null,
  };

  const { data: item, error } = await supabase
    .from('menu_items')
    .insert(insert)
    .select()
    .single();

  if (error) return { error: error.message };

  if (filters.length > 0) {
    await supabase.from('menu_item_filters').insert(
      filters.map((filter) => ({ menu_item_id: item.id, filter }))
    );
  }

  revalidatePath('/admin/menu');
  return { data: item };
}

export async function updateItem(id: string, data: MenuItemInput): Promise<{ data?: Tables<'menu_items'>; error?: string }> {
  const parsed = menuItemSchema.safeParse(data);
  if (!parsed.success) return { error: 'Datos inválidos' };

  const { filters, ...formData } = parsed.data;

  const update: TablesUpdate<'menu_items'> = {
    name: formData.name,
    description: formData.description ?? null,
    price: formData.price,
    is_available: formData.is_available,
    is_sold_out_today: formData.is_sold_out_today,
    prep_time: formData.prep_time ?? null,
  };

  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from('menu_items')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  // Update filters: delete all then reinsert
  await supabase.from('menu_item_filters').delete().eq('menu_item_id', id);
  if (filters.length > 0) {
    await supabase.from('menu_item_filters').insert(
      filters.map((filter) => ({ menu_item_id: id, filter }))
    );
  }

  revalidatePath('/admin/menu');
  return { data: item };
}

export async function toggleItemSoldOut(id: string, isSoldOut: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('menu_items')
    .update({ is_sold_out_today: isSoldOut })
    .eq('id', id);

  revalidatePath('/admin/menu');
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('menu_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/menu');
}
