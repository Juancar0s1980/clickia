import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ChangePasswordModal } from "../account/ChangePasswordModal";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
    isActive ? "text-accent" : "text-primary-dark hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
  }`;

function NavLinks({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  return (
    <>
      <NavLink to="/dashboard" className={NAV_LINK_CLASS} onClick={onNavigate}>
        Panel
      </NavLink>
      {!isAdmin && (
        <>
          <NavLink to="/chat" className={NAV_LINK_CLASS} onClick={onNavigate}>
            Chat
          </NavLink>
          <NavLink to="/tickets" className={NAV_LINK_CLASS} onClick={onNavigate}>
            Tickets
          </NavLink>
          <NavLink to="/planes" className={NAV_LINK_CLASS} onClick={onNavigate}>
            Planes
          </NavLink>
        </>
      )}
      {isAdmin && (
        <>
          <NavLink to="/admin" className={NAV_LINK_CLASS} onClick={onNavigate}>
            Usuarios
          </NavLink>
          <NavLink to="/admin/network-status" className={NAV_LINK_CLASS} onClick={onNavigate}>
            Estado de red
          </NavLink>
          <NavLink to="/admin/tickets" className={NAV_LINK_CLASS} onClick={onNavigate}>
            Tickets
          </NavLink>
        </>
      )}
    </>
  );
}

export function AppShell() {
  const { user, isAdmin, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-surface dark:bg-slate-900">
      <header className="border-b-2 border-primary bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-2 md:flex">
            <NavLinks isAdmin={isAdmin} />
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 lg:inline">{user?.nombre}</span>
            <Button variant="ghost" onClick={() => setShowPasswordModal(true)}>
              Cambiar contraseña
            </Button>
            <Button variant="ghost" onClick={() => logout()}>
              Cerrar sesión
            </Button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-dark hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 dark:border-slate-700 md:hidden">
            <NavLinks isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
            <div className="mt-2 flex flex-col gap-1 border-t border-slate-200 pt-2 dark:border-slate-700">
              <span className="px-3 py-1 text-sm text-slate-600 dark:text-slate-300">{user?.nombre}</span>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setShowPasswordModal(true);
                  setMenuOpen(false);
                }}
              >
                Cambiar contraseña
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
