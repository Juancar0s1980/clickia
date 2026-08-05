export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
        C
      </span>
      <span className="text-lg font-semibold text-primary-dark">ClickIA</span>
    </div>
  );
}
