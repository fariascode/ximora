import { CircleDollarSign, PackageCheck, ReceiptText, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { SaleForm } from '../components/SaleForm';
import { StatCard } from '../components/StatCard';
import { getProducts } from '../services/productsService';
import { getSales, registerSale } from '../services/salesService';
import type { Product } from '../types/product';
import type { SaleFormValues, SaleWithProduct } from '../types/sale';
import { getErrorMessage } from '../utils/appError';
import { formatCurrency } from '../utils/currency';

const paymentMethodLabels = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  other: 'Otro',
};

export function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [productsData, salesData] = await Promise.all([getProducts(), getSales()]);
      setProducts(productsData);
      setSales(salesData);
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudieron cargar las ventas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(values: SaleFormValues) {
    setSaving(true);
    setError('');

    try {
      await registerSale(values);
      await loadData();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo registrar la venta.'));
    } finally {
      setSaving(false);
    }
  }

  const totalSold = sales.reduce((sum, sale) => sum + sale.total_sale, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalPieces = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Ventas</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Registrar movimientos</h1>
        <p className="mt-2 text-sm text-espresso/65">Cada venta descuenta stock y guarda utilidad automaticamente.</p>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total vendido" value={loading ? '...' : formatCurrency(totalSold)} helper="Historial registrado" icon={CircleDollarSign} />
        <StatCard title="Utilidad" value={loading ? '...' : formatCurrency(totalProfit)} helper="Antes de gastos" icon={TrendingUp} />
        <StatCard title="Piezas vendidas" value={loading ? '...' : String(totalPieces)} helper="Unidades totales" icon={PackageCheck} />
        <StatCard title="Ventas" value={loading ? '...' : String(sales.length)} helper="Tickets registrados" icon={ReceiptText} />
      </section>

      <SaleForm products={products} loading={saving} onSubmit={handleSubmit} />

      <section className="panel p-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Historial de ventas</h2>
          <p className="text-sm text-espresso/60">Ultimas ventas registradas en el negocio.</p>
        </div>

        <div className="mt-4 divide-y divide-espresso/10">
          {sales.map((sale) => (
            <article className="grid gap-3 py-4 md:grid-cols-[1fr_auto]" key={sale.id}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-pearl">
                  {sale.product?.image_url ? (
                    <img className="h-full w-full object-cover" src={sale.product.image_url} alt={sale.product.name} />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{sale.product?.name ?? 'Producto eliminado'}</p>
                  <p className="text-sm text-espresso/60">
                    {sale.quantity} pieza(s) - {paymentMethodLabels[sale.payment_method]} - {new Date(sale.sold_at).toLocaleDateString('es-MX')}
                  </p>
                  {sale.customer_name ? <p className="text-sm text-espresso/60">Cliente: {sale.customer_name}</p> : null}
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="font-bold text-ink">{formatCurrency(sale.total_sale)}</p>
                <p className="text-sm text-emerald-700">Utilidad {formatCurrency(sale.profit)}</p>
              </div>
            </article>
          ))}
        </div>

        {!loading && sales.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Sin ventas todavia" description="Registra la primera venta para empezar a medir ingresos y utilidad." />
          </div>
        ) : null}
      </section>
    </div>
  );
}
