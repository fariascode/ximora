import { AlertTriangle, Boxes, CircleDollarSign, PackageCheck, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import { getProducts } from '../services/productsService';
import type { Product } from '../types/product';
import { formatCurrency } from '../utils/currency';

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : 'No se pudo cargar el dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.status !== 'archived');
    const totalInvested = activeProducts.reduce((sum, product) => sum + product.purchase_price * product.stock, 0);
    const inventoryValue = activeProducts.reduce((sum, product) => sum + product.sale_price * product.stock, 0);
    const lowStock = activeProducts.filter((product) => product.stock <= product.min_stock).length;

    return {
      totalProducts: activeProducts.length,
      totalInvested,
      inventoryValue,
      estimatedProfit: inventoryValue - totalInvested,
      lowStock,
    };
  }, [products]);

  const lowStockProducts = products.filter((product) => product.status !== 'archived' && product.stock <= product.min_stock).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Panel principal</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Resumen del negocio</h1>
          <p className="mt-2 text-sm text-espresso/65">Primera vista con inventario y ganancia estimada.</p>
        </div>
        <Link className="btn-primary" to="/products">
          Gestionar productos
        </Link>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Productos" value={loading ? '...' : String(stats.totalProducts)} helper="Activos y agotados" icon={Boxes} />
        <StatCard title="Invertido" value={loading ? '...' : formatCurrency(stats.totalInvested)} helper="Costo del stock actual" icon={CircleDollarSign} />
        <StatCard title="Valor venta" value={loading ? '...' : formatCurrency(stats.inventoryValue)} helper="Precio público del stock" icon={PackageCheck} />
        <StatCard title="Ganancia est." value={loading ? '...' : formatCurrency(stats.estimatedProfit)} helper="Sin ventas/gastos aún" icon={TrendingUp} />
        <StatCard title="Stock bajo" value={loading ? '...' : String(stats.lowStock)} helper="Revisar reposición" icon={AlertTriangle} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Productos recientes</h2>
              <p className="text-sm text-espresso/60">Últimos registros del inventario.</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-espresso/10">
            {products.slice(0, 6).map((product) => (
              <div className="flex items-center justify-between gap-4 py-3" key={product.id}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{product.name}</p>
                  <p className="text-sm text-espresso/60">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink">{formatCurrency(product.sale_price)}</p>
                  <p className="text-sm text-espresso/60">Stock {product.stock}</p>
                </div>
              </div>
            ))}
            {!loading && products.length === 0 ? (
              <EmptyState title="Sin productos todavía" description="Agrega tu primera pieza para comenzar a ver métricas reales." />
            ) : null}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-bold text-ink">Alertas de stock</h2>
          <p className="text-sm text-espresso/60">Piezas en mínimo o por agotarse.</p>

          <div className="mt-4 space-y-3">
            {lowStockProducts.map((product) => (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3" key={product.id}>
                <p className="font-semibold text-amber-950">{product.name}</p>
                <p className="text-sm text-amber-800">Stock {product.stock} / mínimo {product.min_stock}</p>
              </div>
            ))}
            {!loading && lowStockProducts.length === 0 ? (
              <p className="rounded-2xl bg-pearl px-4 py-3 text-sm text-espresso/65">Todo el inventario está por encima del mínimo.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
