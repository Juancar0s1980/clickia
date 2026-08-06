import { ChangeEvent, useRef, useState } from "react";
import { BulkCreateUsersResult } from "../../services/adminApi";
import { parseUsersCsv, usersCsvTemplate } from "../../services/csv";
import { extractErrorMessage } from "../../services/httpClient";
import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";

interface BulkUploadPanelProps {
  isSubmitting: boolean;
  onUpload: (rows: ReturnType<typeof parseUsersCsv>["rows"]) => Promise<BulkCreateUsersResult>;
  onCancel: () => void;
}

function downloadTemplate() {
  const blob = new Blob([usersCsvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla_usuarios.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function BulkUploadPanel({ isSubmitting, onUpload, onCancel }: BulkUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkCreateUsersResult | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setUploadError(null);
    const text = await file.text();
    const { rows, parseErrors: errors } = parseUsersCsv(text);
    setParseErrors(errors);

    if (rows.length === 0) return;

    try {
      const res = await onUpload(rows);
      setResult(res);
    } catch (err) {
      setUploadError(extractErrorMessage(err));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Carga masiva de usuarios (CSV)</p>
        <button type="button" onClick={downloadTemplate} className="text-xs text-primary hover:underline dark:text-blue-300">
          Descargar plantilla
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Columnas requeridas: nombre, email, password, direccion, telefono (opcional), tipoServicio (wifi, tv o
        wifi_tv).
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        disabled={isSubmitting}
        className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark dark:text-slate-300"
      />

      {isSubmitting && <p className="text-xs text-slate-500 dark:text-slate-400">Procesando archivo…</p>}

      {parseErrors.length > 0 && (
        <ErrorBanner message={`No se pudo leer el archivo: ${parseErrors.join(" · ")}`} />
      )}
      {uploadError && <ErrorBanner message={uploadError} />}

      {result && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium text-accent-dark dark:text-accent">{result.created.length} usuarios creados.</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-xs text-red-600 dark:text-red-400">
              {result.errors.map((e) => (
                <li key={e.row}>
                  Fila {e.row} ({e.email || "sin correo"}): {e.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button type="button" variant="ghost" className="w-fit" onClick={onCancel}>
        Cerrar
      </Button>
    </div>
  );
}
