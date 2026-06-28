export function ConfidentialBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-violet-100 text-violet-700 ${className}`}
      title="Confidential — limited visibility"
    >
      Confidential
    </span>
  );
}
