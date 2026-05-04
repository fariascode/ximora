import { getSupabaseClient } from '../lib/supabaseClient';
import type { Sale, SaleFormValues, SaleWithProduct } from '../types/sale';

export async function getSales() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sales')
    .select(
      `
        *,
        product:products (
          id,
          name,
          image_url,
          category
        )
      `,
    )
    .order('sold_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SaleWithProduct[];
}

export async function registerSale(values: SaleFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('register_sale', {
    p_product_id: values.product_id,
    p_quantity: values.quantity,
    p_unit_sale_price: values.unit_sale_price,
    p_payment_method: values.payment_method,
    p_customer_name: values.customer_name.trim() || null,
    p_notes: values.notes.trim() || null,
  });

  if (error) throw error;
  return data as Sale;
}

export async function deleteSale(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('delete_sale', {
    p_sale_id: id,
  });

  if (error) throw error;
}
