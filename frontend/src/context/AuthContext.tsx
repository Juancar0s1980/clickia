import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi";
import { AUTH_LOGOUT_EVENT, tokenStorage } from "../services/tokenStorage";
import { zoneStorage } from "../services/zoneStorage";
import { User } from "../types/api";

// Si el usuario ya registro su zona (casa), la reutilizamos como zona por defecto en
// el chat/dashboard para no volver a preguntarla. Se sincroniza SIEMPRE al iniciar sesion
// (no solo si zoneStorage esta vacio): localStorage es por navegador, no por cuenta, asi
// que un valor de una sesion anterior (otra cuenta, o pruebas previas) no debe pisar la
// zona real de la cuenta que acaba de iniciar sesion. Dentro de la sesion, el usuario
// puede seguir cambiandola a mano (link "cambiar" en el chat / selector del dashboard).
function seedZoneFromUser(user: User | null): void {
  if (user?.zona) {
    zoneStorage.set(user.zona);
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialUser = tokenStorage.get()?.user ?? null;
    setUser(initialUser);
    seedZoneFromUser(initialUser);
    setIsInitializing(false);

    const handleLogout = () => setUser(null);
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    tokenStorage.set(result);
    setUser(result.user);
    seedZoneFromUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    const session = tokenStorage.get();
    tokenStorage.clear();
    setUser(null);
    if (session?.refreshToken) {
      await authApi.logout(session.refreshToken).catch(() => undefined);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.role === "admin",
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
