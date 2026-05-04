import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function UnauthorizedScreen() {
  const { signOut, user } = useAuth();

  return (
    <main className="grid min-h-screen place-items-center bg-ivory px-4 py-8">
      <section className="panel w-full max-w-lg p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-100 text-red-700">
          <ShieldAlert size={28} aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Acceso privado</p>
        <h1 className="mt-2 text-2xl font-black text-ink">Tu correo no esta autorizado</h1>
        <p className="mt-3 text-sm text-espresso/70">
          La cuenta {user?.email} existe en Supabase Auth, pero no esta en la lista de usuarios autorizados de XIMORA Admin.
        </p>
        <button className="btn-secondary mt-6" type="button" onClick={() => void signOut()}>
          Cerrar sesion
        </button>
      </section>
    </main>
  );
}
