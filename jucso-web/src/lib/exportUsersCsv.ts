import type { AdminUserRow } from "@/api/jucsoApi";

export function exportUsersCsv(users: AdminUserRow[], filename = "jucso-users.csv") {
  const headers = ["Reg Number", "Name", "Role", "Ministry", "Email", "Status"];
  const rows = users.map((u) => [
    u.reg,
    u.name,
    u.role,
    u.ministry ?? "",
    u.email ?? "",
    u.isActive === false ? "Inactive" : "Active",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
