export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  // Limpia el timer apenas alguna de las dos promesas resuelve: sin esto, el timer queda
  // pendiente hasta cumplirse igual (deja el proceso de tests colgado con timers sueltos).
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
