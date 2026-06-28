import { STATUS_STYLES } from "@/constants/mock-data";

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}
