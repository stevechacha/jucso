import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-xs font-bold text-jucso-navy mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-jucso-teal focus:ring-2 focus:ring-cyan-100 bg-white transition-all ${className}`}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, className = "", id, ...props }: TextareaProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-xs font-bold text-jucso-navy mb-1.5">
        {label}
      </label>
      <textarea
        id={inputId}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-jucso-teal focus:ring-2 focus:ring-cyan-100 bg-white transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export function Select({ label, children, className = "", id, ...props }: SelectProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-xs font-bold text-jucso-navy mb-1.5">
        {label}
      </label>
      <select
        id={inputId}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-jucso-teal focus:ring-2 focus:ring-cyan-100 bg-white transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
