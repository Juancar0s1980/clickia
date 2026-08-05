import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export function AppShell() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <Logo />
        <nav className="flex items-center gap-2">
          <NavLink to="/dashboard" className={NAV_LINK_CLASS}>
            Panel
          </NavLink>
          <NavLink to="/chat" className={NAV_LINK_CLASS}>
            Chat
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={NAV_LINK_CLASS}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{user?.nombre}</span>
          <Button variant="ghost" onClick={() => logout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
