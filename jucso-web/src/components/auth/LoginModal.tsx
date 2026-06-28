import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { DEMO_USERS } from "@/constants/mock-data";
import type { PortalType, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

const PORTAL_LABELS: Record<PortalType, string> = {
  student: "Student Portal",
  staff: "Staff Portal",
};

const PORTAL_SUBTITLES: Record<PortalType, string> = {
  student: "Sign in with your registration number",
  staff: "Sign in with your PF number",
};

const ID_LABELS: Record<PortalType, string> = {
  student: "Registration Number",
  staff: "PF Number",
};

const PLACEHOLDERS: Record<PortalType, string> = {
  student: "e.g. JUC/2024/001",
  staff: "e.g. MIN/ACAD/001",
};

const showDemoHints = import.meta.env.DEV;
const STAFF_ROLES = new Set(["minister", "executive", "admin"]);

interface LoginModalProps {
  portal: PortalType;
  onLogin: (user: User) => void;
  onClose: () => void;
  onRegister: () => void;
}

export function LoginModal({ portal, onLogin, onClose, onRegister }: LoginModalProps) {
  const [idNumber, setIdNumber] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const idLabel = ID_LABELS[portal];

  const login = async () => {
    if (!idNumber.trim() || !pw.trim()) {
      setErr(`Please enter your ${idLabel.toLowerCase()} and password.`);
      return;
    }

    setLoading(true);
    setErr("");

    try {
      if (isApiEnabled) {
        const user = await jucsoApi.login(idNumber.trim(), pw, portal);
        onLogin(user);
        return;
      }

      const user = DEMO_USERS[idNumber.trim()];
      if (!user) {
        setErr(`${idLabel} not found. Check your details and try again.`);
        return;
      }

      if (portal === "student" && user.role !== "student") {
        setErr("This account uses the Staff Portal.");
        return;
      }

      if (portal === "staff" && !STAFF_ROLES.has(user.role)) {
        setErr("This account uses the Student Portal.");
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
            {PORTAL_LABELS[portal]}
          </div>
          <div className="text-xs text-gray-400 mt-1">{PORTAL_SUBTITLES[portal]}</div>
        </div>

        <form onSubmit={onSubmit}>
          <Input
            label={idLabel}
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder={PLACEHOLDERS[portal]}
            onKeyDown={onKeyDown}
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={showDemoHints ? (isApiEnabled ? "demo123" : "Any password (demo)") : "Your password"}
            onKeyDown={onKeyDown}
            autoComplete="current-password"
          />

          {err && (
            <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2" role="alert">
              {err}
            </p>
          )}

          {showDemoHints && (
            <div className="mt-1 mb-3 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              {portal === "student" ? (
                <>
                  <strong className="text-gray-600">Student demo:</strong> JUC/2024/001
                </>
              ) : (
                <>
                  <strong className="text-gray-600">Staff demo:</strong> MIN/ACAD/001 · EXEC/PRES/001 ·
                  ADMIN/001
                </>
              )}
              {isApiEnabled && (
                <>
                  <br />
                  Password: <strong>demo123</strong>
                </>
              )}
            </div>
          )}

          <Button type="submit" full variant="navy" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </Button>

          {portal === "student" && (
            <button
              type="button"
              onClick={onRegister}
              className="w-full mt-3 text-sm text-jucso-teal font-semibold py-2 hover:underline cursor-pointer"
            >
              New student? Create an account
            </button>
          )}
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
