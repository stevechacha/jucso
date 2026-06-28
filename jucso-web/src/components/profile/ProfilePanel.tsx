import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

export function ProfilePanel() {
  const { user, setUser, apiEnabled } = useApp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const parts = user.name.split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  if (!user) return null;

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiEnabled) {
      setProfileMsg("Profile updates require the live API.");
      return;
    }
    setLoading(true);
    setErr("");
    setProfileMsg("");
    try {
      const updated = await jucsoApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
      });
      setUser(updated);
      setProfileMsg("Profile updated.");
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiEnabled) return;
    setLoading(true);
    setErr("");
    setPasswordMsg("");
    try {
      const res = await jucsoApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setUser(res.user);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMsg(res.message);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="font-display font-bold text-jucso-navy mb-4">Account details</h2>
        <form onSubmit={(e) => void saveProfile(e)}>
          <Input label="PF / Reg number" value={user.reg} disabled />
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255..." />
          {profileMsg && <p className="text-xs text-emerald-700 mb-2">{profileMsg}</p>}
          {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
          <Button type="submit" variant="navy" size="sm" disabled={loading || !apiEnabled}>
            {loading ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-card p-5">
        <h2 className="font-display font-bold text-jucso-navy mb-4">Change password</h2>
        <form onSubmit={(e) => void savePassword(e)}>
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          {passwordMsg && <p className="text-xs text-emerald-700 mb-2">{passwordMsg}</p>}
          <Button type="submit" variant="teal" size="sm" disabled={loading || !apiEnabled}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
