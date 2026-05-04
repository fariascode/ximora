import { AlertTriangle, Boxes, CircleDollarSign, PackageCheck, ReceiptText, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import { getExpenses } from '../services/expensesService';
import { getProducts } from '../services/productsService';
import { getSales } from '../services/salesService';
import type { Expense } from '../types/expense';
import type { Product } from '../types/product';
import type { SaleWithProduct } from '../types/sale';
import { getErrorMessage } from '../utils/appError';
import { formatCurrency } from '../utils/currency';

function isCurrentMonth(date: string) {
  return date.slice(0, 7) === new Date().toISOString().slice(0, 7);
}

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [productsData, salesData, expensesData] = await Promise.all([getProducts(), getSales(), getExpenses()]);
        setProducts(productsData);
        setSales(salesData);
        setExpenses(expensesData);
      } catch (currentError) {
        setError(getErrorMessage(currentError, 'No se pudo cargar el dashboard.'));
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.status !== 'archived');
    const totalInvested = activeProducts.reduce((sum, product) => sum + product.purchase_price * product.stock, 0);
    const inventoryValue = activeProducts.reduce((sum, product) => sum + product.sale_price * product.stock, 0);
    const lowStock = activeProducts.filter((product) => product.stock <= product.min_stock).length;
    const totalSold = sales.reduce((sum, sale) => sum + sale.total_sale, 0);
    const grossProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const realProfit = grossProfit - totalExpenses;
    const monthSales = sales.filter((sale) => isCurrentMonth(sale.sold_at)).reduce((sum, sale) => sum + sale.total_sale, 0);
    const monthExpenses = expenses.filter((expense) => isCurrentMonth(expense.spent_at)).reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalProducts: activeProducts.length,
      totalInvested,
      inventoryValue,
      lowStock,
      totalSold,
      grossProfit,
      totalExpenses,
      realProfit,
      monthSales,
      monthExpenses,
    };
  }, [expenses, products, sales]);

  const lowStockProducts = products.filter((product) => product.status !== 'archived' && product.stock <= product.min_stock).slice(0, 5);
  const recentSales = sales.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const bestSellers = useMemo(() => {
    const totals = new Map<string, { name: string; quantity: number; amount: number }>();

    for (const sale of sales) {
      const name = sale.product?.name ?? 'Producto eliminado';
      const current = totals.get(sale.product_id) ?? { name, quantity: 0, amount: 0 };
      current.quantity += sale.quantity;
      current.amount += sale.total_sale;
      totals.set(sale.product_id, current);
    }

    return Array.from(totals.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Panel principal</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Resumen del negocio</h1>
          <p className="mt-2 text-sm text-espresso/65">Ventas, gastos, utilidad e inventario en una sola vista.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link className="btn-secondary" to="/expenses">
            Registrar gasto
          </Link>
          <Link className="btn-primary" to="/sales">
            Registrar venta
          </Link>
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Vendido" value={loading ? '...' : formatCurrency(stats.totalSold)} helper="Historial completo" icon={CircleDollarSign} />
        <StatCard title="Gastos" value={loading ? '...' : formatCurrency(stats.totalExpenses)} helper="Costos registrados" icon={WalletCards} />
        <StatCard title="Utilidad real" value={loading ? '...' : formatCurrency(stats.realProfit)} helper="Utilidad bruta menos gastos" icon={TrendingUp} />
        <StatCard title="Stock bajo" value={loading ? '...' : String(stats.lowStock)} helper="Revisar reposicion" icon={AlertTriangle} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Ventas del mes" value={loading ? '...' : formatCurrency(stats.monthSales)} helper="Periodo actual" icon={ReceiptText} />
        <StatCard title="Gastos del mes" value={loading ? '...' : formatCurrency(stats.monthExpenses)} helper="Periodo actual" icon={TrendingDown} />
        <StatCard title="Invertido stock" value={loading ? '...' : formatCurrency(stats.totalInvested)} helper="Costo del inventario actual" icon={Boxes} />
        <StatCard title="Valor inventario" value={loading ? '...' : formatCurrency(stats.inventoryValue)} helper="Precio publico del stock" icon={PackageCheck} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Ventas recientes</h2>
              <p className="text-sm text-espresso/60">Ultimos movimientos registrados.</p>
            </div>
            <Link className="btn-secondary px-3 py-2" to="/sales">
              Ver
            </Link>
          </div>

          <div className="mt-4 divide-y divide-espresso/10">
            {recentSales.map((sale) => (
              <div className="flex items-center justify-between gap-4 py-3" key={sale.id}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{sale.product?.name ?? 'Producto eliminado'}</p>
                  <p className="text-sm text-espresso/60">
                    {sale.quantity} pieza(s) - {new Date(sale.sold_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink">{formatCurrency(sale.total_sale)}</p>
                  <p className="text-sm text-emerald-700">Utilidad {formatCurrency(sale.profit)}</p>
                </div>
              </div>
            ))}
            {!loading && recentSales.length === 0 ? (
              <EmptyState title="Sin ventas todavia" description="Registra una venta para empezar a ver ingresos reales." />
            ) : null}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Productos mas vendidos</h2>
          <p className="text-sm text-espresso/60">Ranking por piezas vendidas.</p>

          <div className="mt-4 space-y-3">
            {bestSellers.map((product, index) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-pearl px-4 py-3" key={product.name}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {index + 1}. {product.name}
                  </p>
                  <p className="text-sm text-espresso/60">{product.quantity} pieza(s)</p>
                </div>
                <p className="font-bold text-ink">{formatCurrency(product.amount)}</p>
              </div>
            ))}
            {!loading && bestSellers.length === 0 ? (
              <p className="rounded-2xl bg-pearl px-4 py-3 text-sm text-espresso/65">Aun no hay ventas para crear ranking.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Alertas de stock</h2>
          <p className="text-sm text-espresso/60">Piezas en minimo o por agotarse.</p>

          <div className="mt-4 space-y-3">
            {lowStockProducts.map((product) => (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3" key={product.id}>
                <p className="font-semibold text-amber-950">{product.name}</p>
                <p className="text-sm text-amber-800">
                  Stock {product.stock} / minimo {product.min_stock}
                </p>
              </div>
            ))}
            {!loading && lowStockProducts.length === 0 ? (
              <p className="rounded-2xl bg-pearl px-4 py-3 text-sm text-espresso/65">Todo el inventario esta por encima del minimo.</p>
            ) : null}
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Gastos recientes</h2>
              <p className="text-sm text-espresso/60">Ultimos costos registrados.</p>
            </div>
            <Link className="btn-secondary px-3 py-2" to="/expenses">
              Ver
            </Link>
          </div>

          <div className="mt-4 divide-y divide-espresso/10">
            {recentExpenses.map((expense) => (
              <div className="flex items-center justify-between gap-4 py-3" key={expense.id}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{expense.concept}</p>
                  <p className="text-sm text-espresso/60">{new Date(expense.spent_at).toLocaleDateString('es-MX')}</p>
                </div>
                <p className="font-semibold text-ink">{formatCurrency(expense.amount)}</p>
              </div>
            ))}
            {!loading && recentExpenses.length === 0 ? (
              <EmptyState title="Sin gastos todavia" description="Registra gastos para medir utilidad real." />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
