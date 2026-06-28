import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { sessionLoading } = useApp();

  if (sessionLoading) {
    return (
      fallback ?? (
        <div className="min-h-[50vh] flex items-center justify-center bg-jucso-slate">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-jucso-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading your session…</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
