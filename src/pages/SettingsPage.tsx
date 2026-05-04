import { Building2, Edit3, Plus, Save, Settings, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  createProductCategory,
  deleteProductCategory,
  getBusinessSettings,
  getProductCategories,
  updateBusinessSettings,
  updateProductCategory,
} from '../services/settingsService';
import type { BusinessSettingsFormValues, ProductCategory } from '../types/settings';
import { getErrorMessage } from '../utils/appError';

const emptySettings: BusinessSettingsFormValues = {
  business_name: 'XIMORA',
  currency: 'MXN',
  instagram: '',
  whatsapp: '',
  notes: '',
};

export function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettingsFormValues>(emptySettings);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadSettings() {
    setLoading(true);
    setError('');

    try {
      const [businessSettings, productCategories] = await Promise.all([getBusinessSettings(), getProductCategories()]);
      setSettings({
        business_name: businessSettings.business_name,
        currency: businessSettings.currency,
        instagram: businessSettings.instagram ?? '',
        whatsapp: businessSettings.whatsapp ?? '',
        notes: businessSettings.notes ?? '',
      });
      setCategories(productCategories);
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudieron cargar los ajustes.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function updateSetting<K extends keyof BusinessSettingsFormValues>(key: K, value: BusinessSettingsFormValues[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveBusiness(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      await updateBusinessSettings(settings);
      setNotice('Datos del negocio actualizados.');
      await loadSettings();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudieron guardar los datos del negocio.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      await createProductCategory(name);
      setNewCategory('');
      setNotice('Categoria agregada.');
      await loadSettings();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo crear la categoria.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCategory(category: ProductCategory) {
    setSaving(true);
    setError('');
    setNotice('');

    try {
      await updateProductCategory(category.id, { name: category.name, active: !category.active });
      setNotice(category.active ? 'Categoria desactivada.' : 'Categoria activada.');
      await loadSettings();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo actualizar la categoria.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleRenameCategory(category: ProductCategory) {
    const name = editingCategoryName.trim();
    if (!name) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      await updateProductCategory(category.id, { name, active: category.active });
      setEditingCategoryId('');
      setEditingCategoryName('');
      setNotice('Categoria actualizada.');
      await loadSettings();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo renombrar la categoria.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category: ProductCategory) {
    const ok = window.confirm(`Eliminar la categoria "${category.name}"? Los productos existentes conservaran el texto de su categoria.`);
    if (!ok) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      await deleteProductCategory(category.id);
      setNotice('Categoria eliminada.');
      await loadSettings();
    } catch (currentError) {
      setError(getErrorMessage(currentError, 'No se pudo eliminar la categoria.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Ajustes</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Configuracion del negocio</h1>
        <p className="mt-2 text-sm text-espresso/65">Datos basicos y catalogos editables para XIMORA Admin.</p>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {notice ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p> : null}

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="panel p-5" onSubmit={handleSaveBusiness}>
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-pearl p-3 text-espresso">
              <Building2 size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Datos del negocio</h2>
              <p className="text-sm text-espresso/60">Informacion general para futuras vistas y reportes.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="label">Nombre</span>
              <input className="field" value={settings.business_name} onChange={(event) => updateSetting('business_name', event.target.value)} />
            </label>

            <label className="space-y-1.5">
              <span className="label">Moneda</span>
              <input className="field" value={settings.currency} onChange={(event) => updateSetting('currency', event.target.value.toUpperCase())} />
            </label>

            <label className="space-y-1.5">
              <span className="label">Instagram</span>
              <input className="field" value={settings.instagram} onChange={(event) => updateSetting('instagram', event.target.value)} placeholder="@ximora" />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="label">WhatsApp</span>
              <input className="field" value={settings.whatsapp} onChange={(event) => updateSetting('whatsapp', event.target.value)} placeholder="Opcional" />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="label">Notas</span>
              <textarea className="field min-h-20" value={settings.notes} onChange={(event) => updateSetting('notes', event.target.value)} />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button className="btn-primary" type="submit" disabled={saving || loading}>
              <Save size={18} aria-hidden="true" />
              Guardar
            </button>
          </div>
        </form>

        <section className="panel p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-pearl p-3 text-espresso">
              <Settings size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Categorias de productos</h2>
              <p className="text-sm text-espresso/60">Estas categorias aparecen al crear o editar productos.</p>
            </div>
          </div>

          <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={handleCreateCategory}>
            <input className="field" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nueva categoria" />
            <button className="btn-primary" type="submit" disabled={saving || !newCategory.trim()}>
              <Plus size={18} aria-hidden="true" />
              Agregar
            </button>
          </form>

          <div className="mt-4 divide-y divide-espresso/10">
            {categories.map((category) => (
              <article className="grid gap-3 py-3 sm:grid-cols-[1fr_auto]" key={category.id}>
                {editingCategoryId === category.id ? (
                  <input className="field" value={editingCategoryName} onChange={(event) => setEditingCategoryName(event.target.value)} />
                ) : (
                  <div>
                    <p className="font-bold text-ink">{category.name}</p>
                    <p className="text-sm text-espresso/60">{category.active ? 'Activa' : 'Inactiva'}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {editingCategoryId === category.id ? (
                    <button className="btn-primary px-3" type="button" onClick={() => void handleRenameCategory(category)} disabled={saving}>
                      <Save size={17} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      className="btn-secondary px-3"
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingCategoryName(category.name);
                      }}
                    >
                      <Edit3 size={17} aria-hidden="true" />
                    </button>
                  )}

                  <button className="btn-secondary px-3" type="button" onClick={() => void handleToggleCategory(category)} disabled={saving}>
                    {category.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="btn-danger px-3" type="button" onClick={() => void handleDeleteCategory(category)} disabled={saving}>
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
