export function QuickActionButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-primary/30 bg-white px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary/50 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
    >
      {label}
    </button>
  );
}
