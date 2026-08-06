import { PlanCard } from "../components/plans/PlanCard";
import { Spinner } from "../components/ui/Spinner";
import { usePlans } from "../hooks/usePlans";

export function PlansPage() {
  const { data: plans, isLoading } = usePlans();

  const dobles = (plans ?? []).filter((p) => p.categoria === "doble");
  const triples = (plans ?? []).filter((p) => p.categoria === "triple");

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-8 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Planes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Estos son los planes disponibles para nuevos usuarios. Si quieres cambiarte de plan, cuéntaselo al chat o
          crea un ticket y un asesor comercial te contacta.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {!isLoading && dobles.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-primary dark:text-blue-300">
            Combos: Internet + TV
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dobles.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && triples.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent dark:text-lime-400">
            Triple Combo: Internet + TV + Móvil 20 Gb
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {triples.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
