import { useEffect, useState } from 'react';
import type { Product } from '../types/product';
import type { PaymentMethod, SaleFormValues } from '../types/sale';
import { formatCurrency } from '../utils/currency';

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
];

interface SaleFormProps {
  products: Product[];
  loading?: boolean;
  onSubmit: (values: SaleFormValues) => Promise<void>;
}

export function SaleForm({ products, loading = false, onSubmit }: SaleFormProps) {
  const availableProducts = products.filter((product) => product.status !== 'archived' && product.stock > 0);
  const [values, setValues] = useState<SaleFormValues>({
    product_id: availableProducts[0]?.id ?? '',
    quantity: 1,
    unit_sale_price: availableProducts[0]?.sale_price ?? 0,
    payment_method: 'cash',
    customer_name: '',
    notes: '',
  });

  const selectedProduct = products.find((product) => product.id === values.product_id) ?? null;
  const totalSale = values.quantity * values.unit_sale_price;
  const estimatedProfit = selectedProduct ? totalSale - values.quantity * selectedProduct.purchase_price : 0;

  useEffect(() => {
    if (!values.product_id && availableProducts[0]) {
      setValues((current) => ({
        ...current,
        product_id: availableProducts[0].id,
        unit_sale_price: availableProducts[0].sale_price,
      }));
    }
  }, [availableProducts, values.product_id]);

  function updateField<K extends keyof SaleFormValues>(key: K, value: SaleFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleProductChange(productId: string) {
    const product = products.find((currentProduct) => currentProduct.id === productId);
    setValues((current) => ({
      ...current,
      product_id: productId,
      quantity: 1,
      unit_sale_price: product?.sale_price ?? current.unit_sale_price,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form className="panel p-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold text-ink">Registrar venta</h2>
        <p className="text-sm text-espresso/60">La venta descontara stock y guardara la utilidad.</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="label">Producto</span>
            <select className="field" required value={values.product_id} onChange={(event) => handleProductChange(event.target.value)}>
              <option value="" disabled>
                Selecciona un producto
              </option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - stock {product.stock}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="label">Cantidad</span>
            <input
              className="field"
              min="1"
              max={selectedProduct?.stock ?? 1}
              type="number"
              value={values.quantity}
              onChange={(event) => updateField('quantity', Number(event.target.value))}
            />
          </label>

          <label className="space-y-1.5">
            <span className="label">Precio unitario</span>
            <input
              className="field"
              min="0"
              step="0.01"
              type="number"
              value={values.unit_sale_price}
              onChange={(event) => updateField('unit_sale_price', Number(event.target.value))}
            />
          </label>

          <label className="space-y-1.5">
            <span className="label">Metodo de pago</span>
            <select
              className="field"
              value={values.payment_method}
              onChange={(event) => updateField('payment_method', event.target.value as PaymentMethod)}
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="label">Cliente</span>
            <input
              className="field"
              value={values.customer_name}
              onChange={(event) => updateField('customer_name', event.target.value)}
              placeholder="Opcional"
            />
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

        <aside className="rounded-2xl bg-pearl p-4">
          <p className="text-sm font-semibold text-espresso/60">Resumen</p>
          {selectedProduct ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-16 overflow-hidden rounded-2xl bg-white">
                  {selectedProduct.image_url ? (
                    <img className="h-full w-full object-cover" src={selectedProduct.image_url} alt={selectedProduct.name} />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{selectedProduct.name}</p>
                  <p className="text-sm text-espresso/60">Stock actual: {selectedProduct.stock}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-espresso/55">Total</p>
                  <p className="font-bold text-ink">{formatCurrency(totalSale)}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-espresso/55">Utilidad</p>
                  <p className="font-bold text-ink">{formatCurrency(estimatedProfit)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-espresso/60">Agrega stock a un producto para registrar ventas.</p>
          )}
        </aside>
      </div>

      <div className="mt-5 flex justify-end">
        <button className="btn-primary" type="submit" disabled={loading || !selectedProduct}>
          {loading ? 'Registrando...' : 'Registrar venta'}
        </button>
      </div>
    </form>
  );
}
