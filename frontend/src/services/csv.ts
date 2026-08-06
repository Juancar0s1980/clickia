import { BulkUserRow } from "./adminApi";
import { TipoServicio } from "../types/api";

const EXPECTED_HEADERS = ["nombre", "email", "password", "direccion", "telefono", "tipoServicio"];
const VALID_SERVICES: TipoServicio[] = ["wifi", "tv", "wifi_tv"];

export interface ParsedCsvResult {
  rows: BulkUserRow[];
  parseErrors: string[];
}

// Parser deliberadamente simple (split por comas, sin soporte de comillas/escapes):
// alcanza para el formato de plantilla que la UI ofrece descargar. Un CSV exportado
// desde Excel con comas dentro de campos no funcionaria aqui.
export function parseUsersCsv(text: string): ParsedCsvResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows: [], parseErrors: ["El archivo está vacío."] };
  }

  const header = lines[0]!.split(",").map((h) => h.trim());
  const missing = EXPECTED_HEADERS.filter((h) => h !== "telefono" && !header.includes(h));
  if (missing.length > 0) {
    return { rows: [], parseErrors: [`Faltan columnas requeridas: ${missing.join(", ")}`] };
  }

  const rows: BulkUserRow[] = [];
  const parseErrors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(",").map((v) => v.trim());
    const record: Record<string, string> = {};
    header.forEach((key, idx) => {
      record[key] = values[idx] ?? "";
    });

    const tipoServicio = record.tipoServicio as TipoServicio;
    if (!VALID_SERVICES.includes(tipoServicio)) {
      parseErrors.push(`Fila ${i + 1}: tipoServicio inválido ("${record.tipoServicio}"), debe ser wifi, tv o wifi_tv`);
      continue;
    }

    rows.push({
      nombre: record.nombre ?? "",
      email: record.email ?? "",
      password: record.password ?? "",
      direccion: record.direccion ?? "",
      telefono: record.telefono || undefined,
      tipoServicio,
    });
  }

  return { rows, parseErrors };
}

export function usersCsvTemplate(): string {
  return [
    "nombre,email,password,direccion,telefono,tipoServicio",
    "Juan Pérez,juan.perez@example.com,clave12345,Calle 5 # 10-20 Popayán,3001234567,wifi",
    "Ana Gómez,ana.gomez@example.com,clave12345,Carrera 9 # 4-30 Timbío,,tv",
  ].join("\n");
}
