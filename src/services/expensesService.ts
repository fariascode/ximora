import { getSupabaseClient } from '../lib/supabaseClient';
import type { Expense, ExpenseFormValues } from '../types/expense';

export async function getExpenses() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('expenses').select('*').order('spent_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function createExpense(values: ExpenseFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      concept: values.concept.trim(),
      category: values.category,
      amount: values.amount,
      notes: values.notes.trim() || null,
      spent_at: values.spent_at,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, values: ExpenseFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .update({
      concept: values.concept.trim(),
      category: values.category,
      amount: values.amount,
      notes: values.notes.trim() || null,
      spent_at: values.spent_at,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) throw error;
}
