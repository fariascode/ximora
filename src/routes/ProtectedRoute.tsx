import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-ivory px-4 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-champagne">XIMORA</p>
          <h1 className="mt-3 text-2xl font-bold text-ink">Preparando tu espacio...</h1>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
