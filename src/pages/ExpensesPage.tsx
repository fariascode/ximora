import { CalendarDays, Edit3, Plus, Receipt, Tags, Trash2, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { ExpenseForm } from '../components/ExpenseForm';
import { StatCard } from '../components/StatCard';
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../services/expensesService';
import type { Expense, ExpenseFormValues } from '../types/expense';
import { getErrorMessage } from '../utils/appError';
import { formatCurrency } from '../utils/currency';
import { expenseCategories } from '../utils/expenseCategories';

const categoryLabels = Object.fromEntries(expenseCategories.map((category) => [category.value, category.label]));

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

function matchesMonth(date: string, month: string) {
  if (month === 'all') return true;
  return date.slice(0, 7) === month;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState('all');
  const [month, setMonth] = useState(currentMonthValue());
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadExpenses() {
    setLoading(true);
    setError('');

    try {
      setExpenses(await getExpenses());
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudieron cargar los gastos.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesCategory = category === 'all' || expense.category === category;
      const matchesSelectedMonth = matchesMonth(expense.spent_at, month);
      return matchesCategory && matchesSelectedMonth;
    });
  }, [category, expenses, month]);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const inventoryExpenses = filteredExpenses
    .filter((expense) => expense.category === 'inventory')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const biggestExpense = filteredExpenses.reduce((max, expense) => Math.max(max, expense.amount), 0);
  const categoryCount = new Set(filteredExpenses.map((expense) => expense.category)).size;

  function openNewForm() {
    setEditingExpense(null);
    setError('');
    setNotice('');
    setShowForm(true);
  }

  function openEditForm(expense: Expense) {
    setEditingExpense(expense);
    setError('');
    setNotice('');
    setShowForm(true);
  }

  async function handleSubmit(values: ExpenseFormValues) {
    setSaving(true);
    setError('');
    setNotice('');

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, values);
      } else {
        await createExpense(values);
      }

      setShowForm(false);
      setEditingExpense(null);
      setNotice(editingExpense ? 'Gasto actualizado correctamente.' : 'Gasto registrado correctamente.');
      await loadExpenses();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo guardar el gasto.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense: Expense) {
    const ok = window.confirm(`Eliminar el gasto "${expense.concept}"?`);
    if (!ok) return;

    setError('');
    setNotice('');

    try {
      await deleteExpense(expense.id);
      setNotice('Gasto eliminado correctamente.');
      await loadExpenses();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo eliminar el gasto.'));
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Gastos</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Control de costos</h1>
          <p className="mt-2 text-sm text-espresso/65">Registra salidas de dinero para medir utilidad real.</p>
        </div>
        <button className="btn-primary" type="button" onClick={openNewForm}>
          <Plus size={18} aria-hidden="true" />
          Nuevo
        </button>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {notice ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Gastos" value={loading ? '...' : formatCurrency(totalExpenses)} helper="Segun filtros" icon={WalletCards} />
        <StatCard title="Inventario" value={loading ? '...' : formatCurrency(inventoryExpenses)} helper="Compra de piezas" icon={Receipt} />
        <StatCard title="Mayor gasto" value={loading ? '...' : formatCurrency(biggestExpense)} helper="Registro individual" icon={CalendarDays} />
        <StatCard title="Categorias" value={loading ? '...' : String(categoryCount)} helper="Con movimiento" icon={Tags} />
      </section>

      {showForm ? (
        <ExpenseForm
          expense={editingExpense}
          loading={saving}
          onCancel={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}

      <section className="panel p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas las categorias</option>
            {expenseCategories.map((currentCategory) => (
              <option key={currentCategory.value} value={currentCategory.value}>
                {currentCategory.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input className="field" type="month" value={month === 'all' ? '' : month} onChange={(event) => setMonth(event.target.value || 'all')} />
            <button className="btn-secondary px-3" type="button" onClick={() => setMonth('all')}>
              Todo
            </button>
          </div>
        </div>
      </section>

      {loading ? <p className="panel p-6 text-center text-sm text-espresso/65">Cargando gastos...</p> : null}

      {!loading && filteredExpenses.length === 0 ? (
        <EmptyState title="Sin gastos para mostrar" description="Registra el primer gasto o ajusta los filtros." />
      ) : null}

      <section className="panel p-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Historial de gastos</h2>
          <p className="text-sm text-espresso/60">Movimientos ordenados por fecha.</p>
        </div>

        <div className="mt-4 divide-y divide-espresso/10">
          {filteredExpenses.map((expense) => (
            <article className="grid gap-3 py-4 md:grid-cols-[1fr_auto]" key={expense.id}>
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{expense.concept}</p>
                <p className="text-sm text-espresso/60">
                  {categoryLabels[expense.category]} - {new Date(expense.spent_at).toLocaleDateString('es-MX')}
                </p>
                {expense.notes ? <p className="mt-1 text-sm text-espresso/60">{expense.notes}</p> : null}
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-end">
                <p className="font-bold text-ink md:min-w-28 md:text-right">{formatCurrency(expense.amount)}</p>
                <button className="btn-secondary px-3" type="button" onClick={() => openEditForm(expense)} aria-label={`Editar ${expense.concept}`}>
                  <Edit3 size={17} aria-hidden="true" />
                </button>
                <button className="btn-danger px-3" type="button" onClick={() => void handleDelete(expense)} aria-label={`Eliminar ${expense.concept}`}>
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
