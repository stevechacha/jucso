import type { ContactMessageRow } from "@/api/jucsoApi";

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function exportContactInboxCsv(messages: ContactMessageRow[]) {
  const header = ["ID", "Date", "Name", "Email", "Subject", "Message", "Read", "Admin Reply"];
  const rows = messages.map((m) =>
    [
      m.id,
      m.date,
      m.name,
      m.email,
      m.subject,
      m.message,
      m.is_read ? "yes" : "no",
      m.admin_reply ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jucso-contact-inbox-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
