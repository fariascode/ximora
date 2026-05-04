import { Archive, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { ProductForm } from '../components/ProductForm';
import { archiveProduct, createProduct, deleteProduct, getProducts, updateProduct } from '../services/productsService';
import type { Product, ProductFormValues } from '../types/product';
import { formatCurrency, getProfitMargin } from '../utils/currency';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      setProducts(await getProducts());
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, products, query]);

  function openNewForm() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleSubmit(values: ProductFormValues) {
    setSaving(true);
    setError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
      } else {
        await createProduct(values);
      }

      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(product: Product) {
    const ok = window.confirm(`¿Archivar "${product.name}"?`);
    if (!ok) return;

    await archiveProduct(product.id);
    await loadProducts();
  }

  async function handleDelete(product: Product) {
    const ok = window.confirm(`¿Eliminar definitivamente "${product.name}"?`);
    if (!ok) return;

    await deleteProduct(product.id);
    await loadProducts();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Inventario</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Productos</h1>
          <p className="mt-2 text-sm text-espresso/65">Alta, edición y control básico de piezas.</p>
        </div>
        <button className="btn-primary" type="button" onClick={openNewForm}>
          <Plus size={18} aria-hidden="true" />
          Nuevo
        </button>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      {showForm ? (
        <ProductForm
          product={editingProduct}
          loading={saving}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}

      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-espresso/45" size={18} aria-hidden="true" />
            <input
              className="field pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre"
            />
          </label>
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas las categorías</option>
            {categories.map((currentCategory) => (
              <option key={currentCategory} value={currentCategory}>
                {currentCategory}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? <p className="panel p-6 text-center text-sm text-espresso/65">Cargando productos...</p> : null}

      {!loading && filteredProducts.length === 0 ? (
        <EmptyState title="No hay productos para mostrar" description="Agrega productos o ajusta los filtros para ver el inventario." />
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => {
          const isLowStock = product.status !== 'archived' && product.stock <= product.min_stock;
          const margin = getProfitMargin(product.purchase_price, product.sale_price);

          return (
            <article className="panel overflow-hidden" key={product.id}>
              <div className="aspect-[4/3] bg-pearl">
                {product.image_url ? (
                  <img className="h-full w-full object-cover" src={product.image_url} alt={product.name} />
                ) : (
                  <div className="grid h-full place-items-center text-sm font-semibold text-espresso/45">Sin imagen</div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-ink">{product.name}</h2>
                    <p className="text-sm text-espresso/60">{product.category} · {product.material}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      product.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : product.status === 'sold_out'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {product.status === 'active' ? 'Activo' : product.status === 'sold_out' ? 'Agotado' : 'Archivado'}
                  </span>
                </div>

                {product.description ? <p className="line-clamp-2 text-sm text-espresso/65">{product.description}</p> : null}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-pearl p-3">
                    <p className="text-espresso/55">Costo</p>
                    <p className="font-bold text-ink">{formatCurrency(product.purchase_price)}</p>
                  </div>
                  <div className="rounded-2xl bg-pearl p-3">
                    <p className="text-espresso/55">Venta</p>
                    <p className="font-bold text-ink">{formatCurrency(product.sale_price)}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${isLowStock ? 'bg-amber-50 text-amber-900' : 'bg-pearl text-ink'}`}>
                    <p className={isLowStock ? 'text-amber-700' : 'text-espresso/55'}>Stock</p>
                    <p className="font-bold">{product.stock} piezas</p>
                  </div>
                  <div className="rounded-2xl bg-pearl p-3">
                    <p className="text-espresso/55">Margen</p>
                    <p className="font-bold text-ink">{margin.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button className="btn-secondary px-3" type="button" onClick={() => openEditForm(product)} aria-label={`Editar ${product.name}`}>
                    <Edit3 size={17} aria-hidden="true" />
                  </button>
                  <button className="btn-secondary px-3" type="button" onClick={() => void handleArchive(product)} aria-label={`Archivar ${product.name}`}>
                    <Archive size={17} aria-hidden="true" />
                  </button>
                  <button className="btn-danger px-3" type="button" onClick={() => void handleDelete(product)} aria-label={`Eliminar ${product.name}`}>
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
