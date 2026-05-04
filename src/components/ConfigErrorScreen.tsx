import { AlertCircle } from 'lucide-react';
import { supabaseConfigError } from '../lib/supabaseClient';

export function ConfigErrorScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#f3d9d3_0,#fffaf6_36%,#f8efe7_100%)] px-4 py-8">
      <section className="panel w-full max-w-lg p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-700">
            <AlertCircle size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Configuracion pendiente</p>
            <h1 className="mt-2 text-2xl font-black text-ink">La app no puede conectarse a Supabase</h1>
            <p className="mt-3 text-sm text-espresso/70">{supabaseConfigError}</p>
            <div className="mt-4 rounded-2xl bg-pearl p-4 text-sm text-espresso/75">
              <p>Crea el archivo `.env.local` en la raiz del proyecto con estas variables:</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-xs text-ink">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
              </pre>
              <p className="mt-3">Luego reinicia `npm run dev`.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
