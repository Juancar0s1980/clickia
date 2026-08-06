const COMBINING_MARK_MIN = 0x0300;
const COMBINING_MARK_MAX = 0x036f;

// Normaliza acentos/diacriticos (NFD + descarta marcas combinantes) y pasa a minusculas,
// para que la comparacion de palabras no dependa de tildes ("cuánto" == "cuanto").
export function normalizeText(text: string): string {
  return Array.from(text.toLowerCase().normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0)!;
      return code < COMBINING_MARK_MIN || code > COMBINING_MARK_MAX;
    })
    .join("");
}

// Divide en palabras alfanumericas; minLength descarta palabras demasiado cortas para
// ser una senal util (ej. conectores como "de", "un").
export function tokenize(text: string, minLength = 1): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= minLength);
}
