import { useState } from 'react';
import { Gem } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#f3d9d3_0,#fffaf6_36%,#f8efe7_100%)] px-4 py-8">
      <section className="panel w-full max-w-md p-6">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-espresso text-white shadow-soft">
            <Gem size={28} aria-hidden="true" />
          </span>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-champagne">XIMORA Admin</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Bienvenido</h1>
          <p className="mt-2 text-sm text-espresso/65">Acceso privado para administrar inventario y ventas.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="label">Correo</span>
            <input
              className="field"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ximora.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="label">Contraseña</span>
            <input
              className="field"
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
