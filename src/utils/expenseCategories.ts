import type { ExpenseCategory } from '../types/expense';

export const expenseCategories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'inventory', label: 'Inventario' },
  { value: 'packaging', label: 'Empaque' },
  { value: 'advertising', label: 'Publicidad' },
  { value: 'transport', label: 'Transporte' },
  { value: 'stand', label: 'Stand' },
  { value: 'other', label: 'Otro' },
];
