import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { DEMO_USERS } from "@/constants/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import type { PortalType, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

const showDemoHints = import.meta.env.DEV;
const STAFF_ROLES = new Set(["minister", "executive", "admin"]);

interface LoginModalProps {
  portal: PortalType;
  onLogin: (user: User) => void;
  onClose: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginModal({ portal, onLogin, onClose, onRegister, onForgotPassword }: LoginModalProps) {
  const { t } = useLanguage();
  const [idNumber, setIdNumber] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const idLabel = portal === "student" ? t("authRegNumber") : t("authPfNumber");
  const idField = idLabel.toLowerCase();

  const login = async () => {
    if (!idNumber.trim() || !pw.trim()) {
      setErr(t("authEnterCredentials", { field: idField }));
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
        setErr(t("authAccountNotFound", { field: idLabel }));
        return;
      }

      if (portal === "student" && user.role !== "student") {
        setErr(t("authWrongPortalStaff"));
        return;
      }

      if (portal === "staff" && !STAFF_ROLES.has(user.role)) {
        setErr(t("authWrongPortalStudent"));
        return;
      }

      onLogin(user);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : t("authLoginFailed"));
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
            {portal === "student" ? t("studentPortal") : t("staffPortal")}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {portal === "student" ? t("authSignInStudentSubtitle") : t("authSignInStaffSubtitle")}
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <Input
            label={idLabel}
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder={portal === "student" ? t("authPlaceholderReg") : t("authPlaceholderPf")}
            onKeyDown={onKeyDown}
            autoComplete="username"
          />
          <Input
            label={t("authPassword")}
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={showDemoHints ? (isApiEnabled ? "demo123" : "Any password (demo)") : t("authYourPassword")}
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
            {loading ? t("authSigningIn") : t("authSignIn")}
          </Button>

          <button
            type="button"
            onClick={onForgotPassword}
            className="w-full mt-3 text-sm text-gray-500 font-medium py-2 hover:text-jucso-teal cursor-pointer"
          >
            {t("authForgotPassword")}
          </button>

          {portal === "student" && (
            <button
              type="button"
              onClick={onRegister}
              className="w-full mt-3 text-sm text-jucso-teal font-semibold py-2 hover:underline cursor-pointer"
            >
              {t("authNewStudentRegister")}
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
