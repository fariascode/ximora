import { getSupabaseClient } from '../lib/supabaseClient';
import type { Product, ProductFormValues } from '../types/product';

const table = 'products';

export async function getProducts() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(values: ProductFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(table).insert(values).select('*').single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select('*').single();

  if (error) throw error;
  return data as Product;
}

export async function archiveProduct(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(table).update({ status: 'archived' }).eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) throw error;
}
