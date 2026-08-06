import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Recuperar contraseña</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          La recuperación de contraseña por correo aún no está disponible en esta versión. Si ya iniciaste sesión,
          usa el botón "Cambiar contraseña" desde el chat o el panel.
        </p>
        <Link to="/login" className="text-sm text-primary hover:underline dark:text-blue-300">
          Volver a inicio de sesión
        </Link>
      </div>
    </div>
  );
}
