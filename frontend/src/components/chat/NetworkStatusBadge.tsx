import { NetworkStatus } from "../../types/api";

const STATUS_STYLES: Record<NetworkStatus["status"], string> = {
  operativo: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  mantenimiento: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  falla: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const STATUS_LABELS: Record<NetworkStatus["status"], string> = {
  operativo: "Operativo",
  mantenimiento: "Mantenimiento",
  falla: "Falla reportada",
};

export function NetworkStatusBadge({ status }: { status: NetworkStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status.status]}`}>
      {status.zone}: {STATUS_LABELS[status.status]}
      {status.estimated_time ? ` · ${status.estimated_time}` : ""}
    </span>
  );
}
