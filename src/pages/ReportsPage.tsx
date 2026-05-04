import { Download, PackageCheck, ReceiptText, TrendingUp, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { getExpenses } from '../services/expensesService';
import { getProducts } from '../services/productsService';
import { getSales } from '../services/salesService';
import type { Expense } from '../types/expense';
import type { Product } from '../types/product';
import type { SaleWithProduct } from '../types/sale';
import { getErrorMessage } from '../utils/appError';
import { formatCurrency } from '../utils/currency';
import { expenseCategories } from '../utils/expenseCategories';

const chartColors = ['#3f342d', '#d8b76a', '#8f6f5e', '#c98f86', '#7d8a72', '#c8a24d'];

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

function dateKey(date: string) {
  return date.slice(0, 10);
}

function monthMatches(date: string, month: string) {
  return month === 'all' || date.slice(0, 7) === month;
}

function shortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
  });
}

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState(currentMonthValue());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      setError('');

      try {
        const [productsData, salesData, expensesData] = await Promise.all([getProducts(), getSales(), getExpenses()]);
        setProducts(productsData);
        setSales(salesData);
        setExpenses(expensesData);
      } catch (currentError) {
        setError(getErrorMessage(currentError, 'No se pudieron cargar los reportes.'));
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, []);

  const filteredSales = useMemo(() => sales.filter((sale) => monthMatches(sale.sold_at, month)), [month, sales]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => monthMatches(expense.spent_at, month)), [expenses, month]);

  const totals = useMemo(() => {
    const totalSold = filteredSales.reduce((sum, sale) => sum + sale.total_sale, 0);
    const grossProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const piecesSold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

    return {
      totalSold,
      grossProfit,
      totalExpenses,
      realProfit: grossProfit - totalExpenses,
      piecesSold,
    };
  }, [filteredExpenses, filteredSales]);

  const salesByDay = useMemo(() => {
    const byDay = new Map<string, { date: string; ventas: number; utilidad: number; gastos: number }>();

    for (const sale of filteredSales) {
      const key = dateKey(sale.sold_at);
      const current = byDay.get(key) ?? { date: key, ventas: 0, utilidad: 0, gastos: 0 };
      current.ventas += sale.total_sale;
      current.utilidad += sale.profit;
      byDay.set(key, current);
    }

    for (const expense of filteredExpenses) {
      const key = dateKey(expense.spent_at);
      const current = byDay.get(key) ?? { date: key, ventas: 0, utilidad: 0, gastos: 0 };
      current.gastos += expense.amount;
      byDay.set(key, current);
    }

    return Array.from(byDay.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({ ...row, label: shortDate(row.date) }));
  }, [filteredExpenses, filteredSales]);

  const expensesByCategory = useMemo(() => {
    return expenseCategories
      .map((category) => ({
        name: category.label,
        value: filteredExpenses.filter((expense) => expense.category === category.value).reduce((sum, expense) => sum + expense.amount, 0),
      }))
      .filter((row) => row.value > 0);
  }, [filteredExpenses]);

  const topProducts = useMemo(() => {
    const totalsByProduct = new Map<string, { name: string; cantidad: number; venta: number }>();

    for (const sale of filteredSales) {
      const name = sale.product?.name ?? 'Producto eliminado';
      const current = totalsByProduct.get(sale.product_id) ?? { name, cantidad: 0, venta: 0 };
      current.cantidad += sale.quantity;
      current.venta += sale.total_sale;
      totalsByProduct.set(sale.product_id, current);
    }

    return Array.from(totalsByProduct.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);
  }, [filteredSales]);

  const inventorySummary = useMemo(() => {
    return products
      .filter((product) => product.status !== 'archived')
      .map((product) => ({
        name: product.name,
        stock: product.stock,
        valor: product.stock * product.sale_price,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);
  }, [products]);

  function handleExportCsv() {
    const rows: Array<Array<string | number | null | undefined>> = [
      ['tipo', 'fecha', 'concepto_producto', 'cantidad', 'total', 'utilidad', 'categoria_metodo', 'notas_cliente'],
      ...filteredSales.map((sale) => [
        'venta',
        sale.sold_at,
        sale.product?.name ?? 'Producto eliminado',
        sale.quantity,
        sale.total_sale,
        sale.profit,
        sale.payment_method,
        sale.customer_name,
      ]),
      ...filteredExpenses.map((expense) => ['gasto', expense.spent_at, expense.concept, '', expense.amount, '', expense.category, expense.notes]),
    ];

    downloadCsv(`ximora-reporte-${month}.csv`, rows);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Reportes</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Analisis del negocio</h1>
          <p className="mt-2 text-sm text-espresso/65">Ventas, utilidad, gastos, productos e inventario por periodo.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input className="field" type="month" value={month === 'all' ? '' : month} onChange={(event) => setMonth(event.target.value || 'all')} />
          <button className="btn-secondary" type="button" onClick={() => setMonth('all')}>
            Todo
          </button>
          <button className="btn-primary" type="button" onClick={handleExportCsv} disabled={loading}>
            <Download size={18} aria-hidden="true" />
            CSV
          </button>
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Vendido" value={loading ? '...' : formatCurrency(totals.totalSold)} helper="Ventas del periodo" icon={ReceiptText} />
        <StatCard title="Utilidad bruta" value={loading ? '...' : formatCurrency(totals.grossProfit)} helper="Antes de gastos" icon={TrendingUp} />
        <StatCard title="Gastos" value={loading ? '...' : formatCurrency(totals.totalExpenses)} helper="Costos del periodo" icon={WalletCards} />
        <StatCard title="Utilidad real" value={loading ? '...' : formatCurrency(totals.realProfit)} helper={`${totals.piecesSold} pieza(s) vendidas`} icon={PackageCheck} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Ventas, gastos y utilidad</h2>
          <p className="text-sm text-espresso/60">Movimiento diario del periodo seleccionado.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8d9cc" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={44} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke="#3f342d" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="utilidad" stroke="#7d8a72" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="gastos" stroke="#c98f86" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Gastos por categoria</h2>
          <p className="text-sm text-espresso/60">Distribucion del gasto.</p>
          <div className="mt-5 h-80">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={3}>
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-2xl bg-pearl text-center text-sm text-espresso/60">
                Sin gastos en este periodo.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Productos con mayor venta</h2>
          <p className="text-sm text-espresso/60">Ordenados por cantidad vendida.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8d9cc" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={115} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3f342d" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Valor de inventario</h2>
          <p className="text-sm text-espresso/60">Productos con mayor valor en stock.</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventorySummary} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8d9cc" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={44} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="#d8b76a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
