import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface text-center">
      <p className="text-4xl font-bold text-primary-dark">404</p>
      <p className="text-slate-600">Esta página no existe.</p>
      <Link to="/dashboard" className="text-primary hover:underline">
        Volver al panel
      </Link>
    </div>
  );
}
