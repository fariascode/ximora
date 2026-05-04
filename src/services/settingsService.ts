import { getSupabaseClient } from '../lib/supabaseClient';
import type { BusinessSettings, BusinessSettingsFormValues, ProductCategory } from '../types/settings';

export async function getBusinessSettings() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('business_settings').select('*').eq('id', true).single();

  if (error) throw error;
  return data as BusinessSettings;
}

export async function updateBusinessSettings(values: BusinessSettingsFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('business_settings')
    .upsert({
      id: true,
      business_name: values.business_name.trim() || 'XIMORA',
      currency: values.currency.trim() || 'MXN',
      instagram: values.instagram.trim() || null,
      whatsapp: values.whatsapp.trim() || null,
      notes: values.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as BusinessSettings;
}

export async function getProductCategories() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('product_categories').select('*').order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProductCategory[];
}

export async function createProductCategory(name: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('product_categories').insert({ name: name.trim() }).select('*').single();

  if (error) throw error;
  return data as ProductCategory;
}

export async function updateProductCategory(id: string, values: Pick<ProductCategory, 'name' | 'active'>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('product_categories')
    .update({ name: values.name.trim(), active: values.active })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as ProductCategory;
}

export async function deleteProductCategory(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('product_categories').delete().eq('id', id);

  if (error) throw error;
}
