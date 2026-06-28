export function downloadJsonBackup(data: unknown, filename?: string) {
  const exportedAt =
    typeof data === "object" && data !== null && "exported_at" in data
      ? String((data as { exported_at: string }).exported_at)
      : new Date().toISOString();
  const stamp = exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `jucso-backup-${stamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
  localStorage.setItem("jucso_last_backup", exportedAt);
}

export function getLastBackupLabel(): string | null {
  const raw = localStorage.getItem("jucso_last_backup");
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
