import type { Complaint } from "@/types";

export function exportComplaintsCsv(complaints: Complaint[], filename = "jucso-complaints.csv") {
  const headers = ["ID", "Student", "Category", "Ministry", "Status", "Date", "Urgent", "Confidential", "Description"];
  const rows = complaints.map((c) => [
    c.id,
    c.studentName,
    c.category,
    c.ministry,
    c.status,
    c.date,
    c.urgent ? "Yes" : "No",
    c.isConfidential ? "Yes" : "No",
    c.description.replace(/"/g, '""'),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell)}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
