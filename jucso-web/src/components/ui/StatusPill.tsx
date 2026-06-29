import { STATUS_STYLES } from "@/constants/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { STATUS_LABEL_KEYS } from "@/i18n/translations";

interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  const { t } = useLanguage();
  const key = STATUS_LABEL_KEYS[status];
  const label = key ? t(key) : status;

  return (
    <span
      className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {label}
    </span>
  );
}
