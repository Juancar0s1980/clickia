interface BarChartItem {
  label: string;
  value: number;
}

export function BarChart({ items }: { items: BarChartItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm text-slate-600 dark:text-slate-300" title={item.label}>
            {item.label}
          </span>
          <div className="h-3 flex-1 rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-3 rounded-full bg-accent"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-medium text-slate-700 dark:text-slate-200">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
