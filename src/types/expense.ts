export type ExpenseCategory = 'inventory' | 'packaging' | 'advertising' | 'transport' | 'stand' | 'other';

export interface Expense {
  id: string;
  concept: string;
  category: ExpenseCategory;
  amount: number;
  notes: string | null;
  spent_at: string;
}

export interface ExpenseFormValues {
  concept: string;
  category: ExpenseCategory;
  amount: number;
  notes: string;
  spent_at: string;
}
