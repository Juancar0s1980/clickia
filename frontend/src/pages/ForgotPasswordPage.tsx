import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-2 text-lg font-semibold text-slate-800">Recuperar contraseña</h1>
        <p className="mb-6 text-sm text-slate-500">
          La recuperación de contraseña por correo aún no está disponible en esta versión. Contacta a soporte para
          restablecer tu acceso.
        </p>
        <Link to="/login" className="text-sm text-primary hover:underline">
          Volver a inicio de sesión
        </Link>
      </div>
    </div>
  );
}
