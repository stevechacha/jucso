import type { Suggestion } from "@/types";

export function exportSuggestionsCsv(suggestions: Suggestion[], filename = "jucso-suggestions.csv") {
  const headers = ["ID", "Title", "Student", "Status", "Date", "Description"];
  const rows = suggestions.map((s) => [
    s.id,
    s.title,
    s.studentName,
    s.status,
    s.date,
    s.description.replace(/"/g, '""'),
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
