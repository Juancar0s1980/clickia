import { NavLink } from "react-router-dom";

const LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export function AdminNav() {
  return (
    <nav className="flex gap-2 border-b border-slate-200 bg-white px-6 py-3">
      <NavLink to="/admin" end className={LINK_CLASS}>
        Usuarios
      </NavLink>
      <NavLink to="/admin/network-status" className={LINK_CLASS}>
        Estado de red
      </NavLink>
    </nav>
  );
}
