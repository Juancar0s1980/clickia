import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateUserForm } from "../../components/admin/CreateUserForm";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useAdminUsers, useCreateUserByAdmin } from "../../hooks/useAdmin";
import { extractErrorMessage } from "../../services/httpClient";
import { TipoServicio } from "../../types/api";

const SERVICE_LABELS: Record<TipoServicio, string> = {
  wifi: "Internet / WiFi",
  tv: "TV",
  wifi_tv: "Internet + TV",
};

export function AdminUsersPage() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useAdminUsers();
  const createUser = useCreateUserByAdmin();
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(values: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    tipoServicio: TipoServicio;
  }) {
    try {
      await createUser.mutateAsync(values);
      setShowForm(false);
    } catch {
      // El error se muestra dentro del propio formulario via createUser.error
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Usuarios registrados</h1>
          <p className="text-sm text-slate-500">Crea cuentas de clientes y consulta sus conversaciones.</p>
        </div>
        {!showForm && <Button onClick={() => setShowForm(true)}>+ Registrar usuario</Button>}
      </div>

      {showForm && (
        <CreateUserForm
          isSubmitting={createUser.isPending}
          error={createUser.error ? extractErrorMessage(createUser.error) : null}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card className="overflow-x-auto p-0">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(users ?? []).map((u) => (
                <tr
                  key={u.id}
                  onClick={() => navigate(`/admin/users/${u.id}`)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">{u.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{SERVICE_LABELS[u.tipo_servicio]}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.fecha_creacion).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && (users ?? []).length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">Aún no hay usuarios registrados.</p>
        )}
      </Card>
    </div>
  );
}
