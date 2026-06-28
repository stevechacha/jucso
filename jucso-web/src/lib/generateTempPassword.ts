/** Generate a one-time temporary password for new staff accounts. */
export function generateStaffTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let random = "";
  for (const byte of bytes) {
    random += chars[byte % chars.length];
  }
  return `JUCSO-${random}!`;
}
