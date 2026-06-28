import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { DEMO_USERS } from "@/constants/mock-data";
import type { Role, User } from "@/types";
import { ROLES } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

const PLACEHOLDERS: Record<Role, string> = {
  student: "e.g. JUC/2024/001",
  minister: "e.g. MIN/ACAD/001",
  executive: "e.g. EXEC/PRES/001",
  admin: "e.g. ADMIN/001",
};

interface LoginModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

export function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [role, setRole] = useState<Role>("student");
  const [reg, setReg] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!reg.trim() || !pw.trim()) {
      setErr("Please enter your registration number and password.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      if (isApiEnabled) {
        const user = await jucsoApi.login(reg.trim(), pw, role);
        onLogin(user);
        return;
      }

      const user = DEMO_USERS[reg.trim()];
      if (!user) {
        setErr(
          "Registration number not found. Try: JUC/2024/001, MIN/ACAD/001, EXEC/PRES/001, or ADMIN/001",
        );
        return;
      }
      if (user.role !== role) {
        setErr(`This account is not a ${role} account. Select role: "${user.role}"`);
        return;
      }
      onLogin(user);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") void login();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void login();
  };

  return (
    <div
      className="fixed inset-0 bg-jucso-navy-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-jucso-teal to-jucso-navy flex items-center justify-center mx-auto mb-3 text-white font-black text-base"
            aria-hidden
          >
            JU
          </div>
          <div id="login-title" className="font-display font-bold text-lg text-jucso-navy">
            JUCSO Portal Login
          </div>
          <div className="text-xs text-gray-400 mt-1">Sign in with your registration number</div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1" role="tablist">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={role === r}
                onClick={() => setRole(r)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all cursor-pointer ${
                  role === r ? "bg-jucso-navy text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Input
            label="Registration Number"
            value={reg}
            onChange={(e) => setReg(e.target.value)}
            placeholder={PLACEHOLDERS[role]}
            onKeyDown={onKeyDown}
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={isApiEnabled ? "demo123" : "Any password (demo)"}
            onKeyDown={onKeyDown}
            autoComplete="current-password"
          />

          {err && (
            <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2" role="alert">
              {err}
            </p>
          )}

          <div className="mt-1 mb-3 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
            <strong className="text-gray-600">Demo accounts:</strong>
            <br />
            Student: JUC/2024/001 · Minister: MIN/ACAD/001
            <br />
            Executive: EXEC/PRES/001 · Admin: ADMIN/001
            {isApiEnabled && (
              <>
                <br />
                Password: <strong>demo123</strong>
              </>
            )}
          </div>

          <Button type="submit" full variant="navy" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </Button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
