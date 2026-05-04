import { useEffect, useState } from 'react';
import type { Expense, ExpenseCategory, ExpenseFormValues } from '../types/expense';
import { expenseCategories } from '../utils/expenseCategories';

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const emptyExpense: ExpenseFormValues = {
  concept: '',
  category: 'other',
  amount: 0,
  notes: '',
  spent_at: todayDate(),
};

interface ExpenseFormProps {
  expense?: Expense | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
}

export function ExpenseForm({ expense, loading = false, onCancel, onSubmit }: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormValues>(emptyExpense);

  useEffect(() => {
    setValues(
      expense
        ? {
            concept: expense.concept,
            category: expense.category,
            amount: expense.amount,
            notes: expense.notes ?? '',
            spent_at: expense.spent_at.slice(0, 10),
          }
        : emptyExpense,
    );
  }, [expense]);

  function updateField<K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      ...values,
      amount: Number(values.amount),
    });
  }

  return (
    <form className="panel p-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold text-ink">{expense ? 'Editar gasto' : 'Nuevo gasto'}</h2>
        <p className="text-sm text-espresso/60">Registra compras, empaque, transporte y otros costos.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="label">Concepto</span>
          <input
            className="field"
            required
            value={values.concept}
            onChange={(event) => updateField('concept', event.target.value)}
            placeholder="Bolsas para joyeria"
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Categoria</span>
          <select
            className="field"
            value={values.category}
            onChange={(event) => updateField('category', event.target.value as ExpenseCategory)}
          >
            {expenseCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">Monto</span>
          <input
            className="field"
            min="0"
            step="0.01"
            type="number"
            value={values.amount}
            onChange={(event) => updateField('amount', Number(event.target.value))}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Fecha</span>
          <input className="field" type="date" value={values.spent_at} onChange={(event) => updateField('spent_at', event.target.value)} />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="label">Notas</span>
          <textarea
            className="field min-h-20"
            value={values.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Opcional"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar gasto'}
        </button>
      </div>
    </form>
  );
}
