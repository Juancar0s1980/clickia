import { AdminNav } from "../../components/admin/AdminNav";
import { NetworkStatusRow } from "../../components/admin/NetworkStatusRow";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminNetworkStatus, useUpdateNetworkStatus } from "../../hooks/useAdmin";
import { extractErrorMessage } from "../../services/httpClient";
import { NetworkServiceStatus } from "../../types/api";

export function AdminNetworkStatusPage() {
  const { data: statuses, isLoading } = useAdminNetworkStatus();
  const updateStatus = useUpdateNetworkStatus();

  return (
    <div className="flex h-full flex-col">
      <AdminNav />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 overflow-y-auto p-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Estado de red por zona</h1>
          <p className="text-sm text-slate-500">
            Esto es lo que el chatbot consulta antes de diagnosticar un problema.
          </p>
        </div>

        {updateStatus.error && <ErrorBanner message={extractErrorMessage(updateStatus.error)} />}

        <Card className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Spinner />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Tiempo estimado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(statuses ?? []).map((s) => (
                  <NetworkStatusRow
                    key={s.zone}
                    status={s}
                    isSaving={updateStatus.isPending}
                    onSave={(status: NetworkServiceStatus, estimatedTime) =>
                      updateStatus.mutate({ zone: s.zone, status, estimatedTime })
                    }
                  />
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
