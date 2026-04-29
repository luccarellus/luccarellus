export function isAdminByEmail(email: string | null | undefined): boolean {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return false;

  const raw = String(process.env.ADMIN_EMAILS || '').trim();
  if (!raw) return false;

  const admins = raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(normalizedEmail);
}

