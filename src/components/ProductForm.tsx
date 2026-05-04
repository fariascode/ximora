import { useEffect, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { uploadProductImage } from '../services/storageService';
import type { Product, ProductFormValues } from '../types/product';
import { getErrorMessage } from '../utils/appError';

const emptyProduct: ProductFormValues = {
  name: '',
  category: '',
  material: 'Acero inoxidable',
  description: '',
  purchase_price: 0,
  sale_price: 0,
  stock: 0,
  min_stock: 1,
  image_url: '',
  status: 'active',
};

interface ProductFormProps {
  product?: Product | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductForm({ product, loading = false, onCancel, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyProduct);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    setSelectedImage(null);
    setPreviewUrl(product?.image_url ?? '');
    setImageError('');
    setValues(
      product
        ? {
            name: product.name,
            category: product.category,
            material: product.material,
            description: product.description ?? '',
            purchase_price: product.purchase_price,
            sale_price: product.sale_price,
            stock: product.stock,
            min_stock: product.min_stock,
            image_url: product.image_url ?? '',
            status: product.status,
          }
        : emptyProduct,
    );
  }, [product]);

  useEffect(() => {
    if (!selectedImage) return;

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  function updateField<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('Selecciona una imagen valida.');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setImageError('La imagen debe pesar menos de 6 MB.');
      return;
    }

    setSelectedImage(file);
    event.target.value = '';
  }

  function clearImage() {
    setSelectedImage(null);
    setPreviewUrl('');
    updateField('image_url', null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setImageError('');

    try {
      const uploadedImageUrl = selectedImage ? await uploadProductImage(selectedImage) : values.image_url;

      await onSubmit({
        ...values,
        purchase_price: Number(values.purchase_price),
        sale_price: Number(values.sale_price),
        stock: Number(values.stock),
        min_stock: Number(values.min_stock),
        description: values.description?.trim() || null,
        image_url: uploadedImageUrl?.trim() || null,
      });
    } catch (error) {
      setImageError(getErrorMessage(error, 'No se pudo subir la imagen.'));
    } finally {
      setUploading(false);
    }
  }

  const isBusy = loading || uploading;

  return (
    <form className="panel p-5" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <p className="text-sm text-espresso/60">Captura la informacion principal del inventario.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="label">Nombre</span>
          <input
            className="field"
            required
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Arracadas doradas"
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Categoria</span>
          <input
            className="field"
            required
            value={values.category}
            onChange={(event) => updateField('category', event.target.value)}
            placeholder="Aretes, pulseras..."
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Material</span>
          <input
            className="field"
            value={values.material}
            onChange={(event) => updateField('material', event.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Estado</span>
          <select
            className="field"
            value={values.status}
            onChange={(event) => updateField('status', event.target.value as ProductFormValues['status'])}
          >
            <option value="active">Activo</option>
            <option value="sold_out">Agotado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="label">Costo</span>
          <input
            className="field"
            min="0"
            step="0.01"
            type="number"
            value={values.purchase_price}
            onChange={(event) => updateField('purchase_price', Number(event.target.value))}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Precio venta</span>
          <input
            className="field"
            min="0"
            step="0.01"
            type="number"
            value={values.sale_price}
            onChange={(event) => updateField('sale_price', Number(event.target.value))}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Stock</span>
          <input
            className="field"
            min="0"
            type="number"
            value={values.stock}
            onChange={(event) => updateField('stock', Number(event.target.value))}
          />
        </label>

        <label className="space-y-1.5">
          <span className="label">Stock minimo</span>
          <input
            className="field"
            min="0"
            type="number"
            value={values.min_stock}
            onChange={(event) => updateField('min_stock', Number(event.target.value))}
          />
        </label>

        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <span className="label">Foto del producto</span>
            {previewUrl ? (
              <button className="btn-secondary px-3 py-2" type="button" onClick={clearImage} aria-label="Quitar imagen">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="aspect-square overflow-hidden rounded-2xl border border-espresso/10 bg-pearl">
              {previewUrl ? (
                <img className="h-full w-full object-cover" src={previewUrl} alt="Vista previa del producto" />
              ) : (
                <div className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-espresso/45">
                  Sin foto
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-3 rounded-2xl border border-dashed border-espresso/20 bg-ivory p-4">
              <div>
                <p className="text-sm font-semibold text-ink">Toma una foto o elige una imagen</p>
                <p className="mt-1 text-sm text-espresso/60">
                  En celular abre la camara o galeria. En computadora abre tus archivos.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="btn-primary cursor-pointer">
                  <Camera size={18} aria-hidden="true" />
                  Tomar foto
                  <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
                </label>

                <label className="btn-secondary cursor-pointer">
                  <ImagePlus size={18} aria-hidden="true" />
                  Elegir imagen
                  <input className="sr-only" type="file" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              {imageError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{imageError}</p> : null}
            </div>
          </div>
        </div>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="label">Descripcion</span>
          <textarea
            className="field min-h-24"
            value={values.description ?? ''}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Notas, color, tamano o proveedor"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn-primary" type="submit" disabled={isBusy}>
          {uploading ? 'Subiendo foto...' : loading ? 'Guardando...' : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}
