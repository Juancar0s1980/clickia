const STORAGE_KEY = "clickia.zone";

// La zona del usuario no se pide en cada chat: se guarda localmente la primera
// vez que la indica y se reutiliza en las siguientes sesiones.
export const zoneStorage = {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  },

  set(zone: string): void {
    localStorage.setItem(STORAGE_KEY, zone);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
