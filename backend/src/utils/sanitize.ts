const NEWLINE_CODE = 10;
const MAX_PRINTABLE_CONTROL_CODE = 31;
const DEL_CODE = 127;

// Quita caracteres de control (que no aportan nada en texto de usuario y pueden usarse
// para ofuscar contenido) y colapsa espacios repetidos. No reemplaza la validacion de
// longitud/formato de zod, es una limpieza adicional antes de persistir o loguear texto libre.
export function sanitizeText(input: string): string {
  const withoutControlChars = Array.from(input)
    .filter((ch) => {
      const code = ch.codePointAt(0)!;
      if (code === NEWLINE_CODE) return true;
      if (code <= MAX_PRINTABLE_CONTROL_CODE) return false;
      if (code === DEL_CODE) return false;
      return true;
    })
    .join("");

  return withoutControlChars.replace(/[ \t]{2,}/g, " ").trim();
}
