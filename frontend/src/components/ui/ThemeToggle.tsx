import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {theme === "light" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm9-6a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM5 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm12.66-6.66a1 1 0 0 1 0 1.42l-.71.7a1 1 0 1 1-1.41-1.4l.7-.72a1 1 0 0 1 1.42 0ZM8.46 17.46a1 1 0 0 1 0 1.42l-.71.7a1 1 0 1 1-1.41-1.4l.7-.72a1 1 0 0 1 1.42 0Zm9.9 1.42a1 1 0 0 1-1.42 0l-.7-.71a1 1 0 1 1 1.4-1.41l.72.7a1 1 0 0 1 0 1.42ZM7.05 6.46a1 1 0 0 1-1.42 0l-.7-.71a1 1 0 0 1 1.4-1.41l.72.7a1 1 0 0 1 0 1.42ZM12 20a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354Z" />
        </svg>
      )}
    </button>
  );
}
