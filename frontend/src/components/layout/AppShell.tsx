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

export function AppShell() {
  const { user, isAdmin, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-surface dark:bg-slate-900">
      <header className="flex items-center justify-between border-b-2 border-primary bg-white px-6 py-3 dark:bg-slate-800">
        <Logo />
        <nav className="flex items-center gap-2">
          <NavLink to="/dashboard" className={NAV_LINK_CLASS}>
            Panel
          </NavLink>
          {!isAdmin && (
            <>
              <NavLink to="/chat" className={NAV_LINK_CLASS}>
                Chat
              </NavLink>
              <NavLink to="/tickets" className={NAV_LINK_CLASS}>
                Tickets
              </NavLink>
              <NavLink to="/planes" className={NAV_LINK_CLASS}>
                Planes
              </NavLink>
            </>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin" className={NAV_LINK_CLASS}>
                Usuarios
              </NavLink>
              <NavLink to="/admin/network-status" className={NAV_LINK_CLASS}>
                Estado de red
              </NavLink>
              <NavLink to="/admin/tickets" className={NAV_LINK_CLASS}>
                Tickets
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">{user?.nombre}</span>
          <Button variant="ghost" onClick={() => setShowPasswordModal(true)}>
            Cambiar contraseña
          </Button>
          <Button variant="ghost" onClick={() => logout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
