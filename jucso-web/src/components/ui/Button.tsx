import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "navy" | "teal" | "gold" | "ghost" | "outline" | "danger" | "white";
type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  navy: "bg-jucso-navy text-white hover:bg-[#243a8a] shadow-sm",
  teal: "bg-jucso-teal text-white hover:bg-[#009eb5] shadow-sm",
  gold: "bg-jucso-gold text-jucso-navy-dark hover:bg-[#e8952a] shadow-sm",
  ghost: "bg-transparent border-2 border-white/30 text-white hover:border-white/60",
  outline:
    "bg-transparent border-2 border-jucso-navy text-jucso-navy hover:bg-jucso-navy hover:text-white",
  danger: "bg-red-600 text-white hover:bg-red-700",
  white: "bg-white text-jucso-navy hover:bg-gray-50 border border-gray-200",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

export function Button({
  children,
  variant = "navy",
  size = "md",
  full = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";

  return (
    <button
      type="button"
      disabled={disabled}
      className={`font-bold rounded-lg transition-all duration-200 ${VARIANTS[variant]} ${sizeClass} ${full ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:-translate-y-px active:translate-y-0"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
