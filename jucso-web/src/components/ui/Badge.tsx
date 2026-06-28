import type { ReactNode } from "react";

type BadgeVariant = "teal" | "navy" | "gold" | "green" | "gray";

const VARIANTS: Record<BadgeVariant, string> = {
  teal: "bg-cyan-50 text-cyan-700 border-cyan-200",
  navy: "bg-indigo-50 text-indigo-800 border-indigo-200",
  gold: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = "teal" }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}

export function newsTagVariant(tag: string): BadgeVariant {
  if (tag === "Announcement") return "teal";
  if (tag === "Events") return "gold";
  if (tag === "Clubs") return "navy";
  return "gray";
}
