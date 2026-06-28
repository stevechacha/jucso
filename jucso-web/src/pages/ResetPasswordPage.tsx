import { useEffect, useState, type FormEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { Hero } from "@/components/layout/Hero";

function readResetParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    uid: params.get("uid") ?? "",
    token: params.get("token") ?? "",
  };
}

export function ResetPasswordPage() {
  const { setPage, openLogin } = useApp();
  const [{ uid, token }, setResetParams] = useState(readResetParams);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResetParams(readResetParams());
  }, []);

  const hasValidLink = Boolean(uid && token);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasValidLink) {
      setErr("This reset link is invalid. Request a new password reset.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (!isApiEnabled) {
      setErr("Password reset requires a connected API.");
      return;
    }

    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const message = await jucsoApi.confirmPasswordReset({ uid, token, password });
      setSuccess(message);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Hero
        badge="Account security"
        title="Reset your password"
        subtitle="Choose a new password for your JUCSO portal account."
      />
      <section className="page-section bg-jucso-slate">
        <div className="section-container max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            {!hasValidLink ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  This link is missing or invalid. Request a new reset email from the sign-in screen.
                </p>
                <Button variant="navy" full onClick={() => openLogin("student")}>
                  Back to sign in
                </Button>
              </div>
            ) : success ? (
              <div className="text-center">
                <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3 mb-4" role="status">
                  {success}
                </p>
                <Button variant="navy" full onClick={() => openLogin("student")}>
                  Sign in →
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => void submit(e)}>
                <Input
                  label="New password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                {err && (
                  <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2" role="alert">
                    {err}
                  </p>
                )}
                <Button type="submit" full variant="navy" disabled={loading}>
                  {loading ? "Updating…" : "Update password"}
                </Button>
                <button
                  type="button"
                  onClick={() => setPage("home")}
                  className="w-full mt-3 text-sm text-gray-400 py-2 hover:text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
