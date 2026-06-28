import { useState, type FormEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

interface RegisterModalProps {
  onRegistered: (user: User) => void;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function RegisterModal({ onRegistered, onClose, onBackToLogin }: RegisterModalProps) {
  const [form, setForm] = useState({
    reg_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.reg_number.trim() || !form.first_name.trim() || !form.last_name.trim()) {
      setErr("Please fill in all required fields.");
      return;
    }
    if (!form.email.trim() || !form.password) {
      setErr("Email and password are required.");
      return;
    }
    if (form.password !== form.confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (!isApiEnabled) {
      setErr("Registration is only available when the API is connected.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const user = await jucsoApi.registerStudent({
        reg_number: form.reg_number.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number.trim() || undefined,
      });
      onRegistered(user);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Registration failed. Please try again.");
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
      aria-labelledby="register-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-jucso-teal to-jucso-navy flex items-center justify-center mx-auto mb-3 text-white font-black text-base"
            aria-hidden
          >
            JU
          </div>
          <div id="register-title" className="font-display font-bold text-lg text-jucso-navy">
            Student Registration
          </div>
          <div className="text-xs text-gray-400 mt-1">Create your JUCSO student account</div>
        </div>

        <form onSubmit={(e) => void submit(e)}>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              required
            />
          </div>
          <Input
            label="Registration Number"
            value={form.reg_number}
            onChange={(e) => update("reg_number", e.target.value)}
            placeholder="e.g. JUC/2025/042"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Phone (optional)"
            value={form.phone_number}
            onChange={(e) => update("phone_number", e.target.value)}
            placeholder="+255..."
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            minLength={8}
            required
          />

          {err && (
            <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2" role="alert">
              {err}
            </p>
          )}

          <Button type="submit" full variant="navy" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </Button>
        </form>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-3 text-sm text-jucso-teal font-semibold py-2 hover:underline cursor-pointer"
        >
          Already have an account? Sign in
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-gray-400 py-2 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
