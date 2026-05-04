import { BarChart3, Gem, LayoutDashboard, LogOut, Package, ReceiptText } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/sales', label: 'Ventas', icon: ReceiptText },
  { to: '/reports', label: 'Reportes', icon: BarChart3, disabled: true },
];

export function AppLayout() {
  const { signOut, user } = useAuth();

  return (
    <div className="app-shell lg:flex">
      <aside className="hidden min-h-screen w-72 border-r border-espresso/10 bg-white/70 px-5 py-6 lg:flex lg:flex-col">
        <Brand />
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-pearl p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">Sesión</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{user?.email}</p>
          <button className="btn-secondary mt-4 w-full" type="button" onClick={() => void signOut()}>
            <LogOut size={18} aria-hidden="true" />
            Salir
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="sticky top-0 z-10 border-b border-espresso/10 bg-ivory/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Brand compact />
            <button className="btn-secondary px-3 lg:hidden" type="button" onClick={() => void signOut()} aria-label="Cerrar sesión">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-espresso/10 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(63,52,45,0.08)] backdrop-blur lg:hidden">
        {navItems.map((item) => (
          <MobileNavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-2xl bg-espresso text-white shadow-soft">
        <Gem size={22} aria-hidden="true" />
      </span>
      <div>
        <p className="text-lg font-black tracking-wide text-ink">XIMORA</p>
        {!compact ? <p className="text-xs font-medium uppercase tracking-[0.18em] text-champagne">Admin</p> : null}
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, disabled }: (typeof navItems)[number]) {
  if (disabled) {
    return (
      <span className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-espresso/35">
        <Icon size={19} aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
          isActive ? 'bg-espresso text-white' : 'text-espresso/70 hover:bg-pearl hover:text-ink'
        }`
      }
    >
      <Icon size={19} aria-hidden="true" />
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon: Icon, disabled }: (typeof navItems)[number]) {
  if (disabled) {
    return (
      <span className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-espresso/30">
        <Icon size={19} aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
          isActive ? 'bg-espresso text-white' : 'text-espresso/65'
        }`
      }
    >
      <Icon size={19} aria-hidden="true" />
      {label}
    </NavLink>
  );
}
