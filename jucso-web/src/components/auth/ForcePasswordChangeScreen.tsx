import { useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

export function ForcePasswordChangeScreen() {
  const { user, setUser } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setErr("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setErr("Choose a different password from your temporary one.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const { user: updated } = await jucsoApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setUser(updated);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-jucso-slate px-6 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-[10px] font-bold uppercase tracking-wide text-jucso-teal mb-2">
            Security required
          </div>
          <h1 className="font-display font-bold text-xl text-jucso-navy">Set your new password</h1>
          <p className="text-sm text-gray-500 mt-2">
            Welcome, {user.name.split(" ")[0]}. Your administrator issued a temporary password — replace it
            before using the portal.
          </p>
        </div>

        <form onSubmit={(e) => void submit(e)}>
          <Input
            label="Temporary password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <p className="text-[11px] text-gray-400 mb-4">
            Use at least 8 characters with letters and numbers. Avoid common words and your PF number.
          </p>

          {err && (
            <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2" role="alert">
              {err}
            </p>
          )}

          <Button type="submit" full variant="navy" disabled={loading}>
            {loading ? "Saving…" : "Save & continue to dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
