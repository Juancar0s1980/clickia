import { sanitizeText } from "./sanitize";

describe("sanitizeText", () => {
  it("recorta espacios al inicio y al final", () => {
    expect(sanitizeText("  hola mundo  ")).toBe("hola mundo");
  });

  it("colapsa espacios y tabs repetidos", () => {
    expect(sanitizeText("hola     mundo\t\tcon espacios")).toBe("hola mundo con espacios");
  });

  it("elimina caracteres de control pero conserva saltos de línea", () => {
    const bellChar = String.fromCharCode(7);
    const withControlChars = `linea uno\nlinea dos${bellChar} fin`;
    expect(sanitizeText(withControlChars)).toBe("linea uno\nlinea dos fin");
  });

  it("no altera texto normal con acentos y signos", () => {
    expect(sanitizeText("¿Por qué no tengo señal en mi router?")).toBe("¿Por qué no tengo señal en mi router?");
  });
});
