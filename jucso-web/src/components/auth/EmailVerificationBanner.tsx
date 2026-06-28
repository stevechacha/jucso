import { useState } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";

export function EmailVerificationBanner() {
  const { user, apiEnabled, refreshPortalData } = useApp();
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "student" || user.emailVerified !== false) return null;

  const resend = async () => {
    if (!apiEnabled) return;
    setLoading(true);
    setMessage("");
    try {
      const detail = await jucsoApi.resendVerification({ reg_number: user.reg, email: user.email });
      setMessage(detail);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!apiEnabled) return;
    await refreshPortalData();
  };

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
      <p className="font-semibold mb-1">{t("verifyEmailTitle")}</p>
      <p className="text-amber-800/80 mb-2">
        We sent a verification link to {user.email ?? "your inbox"}. Check spam if you don&apos;t see it.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => void resend()} disabled={loading}>
          {loading ? "Sending…" : t("resendEmail")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void refresh()}>
          {t("verifiedRefresh")}
        </Button>
      </div>
      {message ? <p className="mt-2 text-amber-800">{message}</p> : null}
    </div>
  );
}
