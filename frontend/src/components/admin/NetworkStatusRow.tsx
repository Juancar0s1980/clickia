import { useState } from "react";
import { Button } from "../ui/Button";
import { NetworkServiceStatus, NetworkStatus } from "../../types/api";

const STATUS_OPTIONS: NetworkServiceStatus[] = ["operativo", "mantenimiento", "falla"];

interface NetworkStatusRowProps {
  status: NetworkStatus;
  isSaving: boolean;
  onSave: (status: NetworkServiceStatus, estimatedTime: string | null) => void;
}

export function NetworkStatusRow({ status, isSaving, onSave }: NetworkStatusRowProps) {
  const [value, setValue] = useState<NetworkServiceStatus>(status.status);
  const [estimatedTime, setEstimatedTime] = useState(status.estimated_time ?? "");

  const isDirty = value !== status.status || estimatedTime !== (status.estimated_time ?? "");

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{status.zone}</td>
      <td className="px-4 py-3">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value as NetworkServiceStatus)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          placeholder="ej. 30 minutos"
          className="w-40 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </td>
      <td className="px-4 py-3">
        <Button
          variant="secondary"
          disabled={!isDirty}
          isLoading={isSaving}
          onClick={() => onSave(value, estimatedTime.trim() || null)}
        >
          Guardar
        </Button>
      </td>
    </tr>
  );
}
