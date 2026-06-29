export interface AttendeeRow {
  reg_number: string;
  name: string;
  email: string;
  date: string;
}

export function exportAttendeesCsv(attendees: AttendeeRow[], filename: string) {
  const headers = ["Reg Number", "Name", "Email", "Date"];
  const rows = attendees.map((a) => [a.reg_number, a.name, a.email, a.date]);

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
