interface SpinnerProps {
  size?: "sm" | "md";
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
};

export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${SIZE_CLASSES[size]}`}
    />
  );
}
