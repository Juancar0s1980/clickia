import logoIcon from "../../assets/logo-icon.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoIcon} alt="" className="h-9 w-9" />
      <span className="text-lg font-semibold text-primary-dark dark:text-blue-300">ClickIA</span>
    </div>
  );
}
