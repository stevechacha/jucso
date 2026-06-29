import { useState, type FormEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordModal({ onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !regNumber.trim()) {
      setErr(t("authForgotEnterEmailOrReg"));
      return;
    }
    if (!isApiEnabled) {
      setErr(t("authForgotApiOnly"));
      return;
    }

    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const message = await jucsoApi.requestPasswordReset({
        email: email.trim() || undefined,
        reg_number: regNumber.trim() || undefined,
      });
      setSuccess(message);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : t("authForgotSendFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-jucso-navy-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-title"
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
          <div id="forgot-title" className="font-display font-bold text-lg text-jucso-navy">
            {t("authForgotTitle")}
          </div>
          <div className="text-xs text-gray-400 mt-1">{t("authForgotSubtitle")}</div>
        </div>

        {success ? (
          <div>
            <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3 mb-4" role="status">
              {success}
            </p>
            <Button variant="navy" full onClick={onBackToLogin}>
              {t("authBackToSignIn")}
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)}>
            <Input
              label={t("authEmail")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <p className="text-center text-xs text-gray-400 my-1">{t("authForgotOr")}</p>
            <Input
              label={t("authRegOrPf")}
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder={t("authPlaceholderReg")}
              autoComplete="username"
            />
            {err && (
              <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2" role="alert">
                {err}
              </p>
            )}
            <Button type="submit" full variant="navy" disabled={loading}>
              {loading ? t("authSending") : t("authSendResetLink")}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-3 text-sm text-jucso-teal font-semibold py-2 hover:underline cursor-pointer"
        >
          {t("authBackToSignIn")}
        </button>
      </div>
    </div>
  );
}
