interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

export function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="text-2xl mb-2" aria-hidden>
        {icon}
      </div>
      <div className="font-display font-bold text-2xl" style={{ color }}>
        {value}
      </div>
      <div className="text-gray-400 text-[10px] uppercase tracking-wide mt-1 font-semibold">
        {label}
      </div>
    </div>
  );
}
