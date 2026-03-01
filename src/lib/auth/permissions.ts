type Role = "admin" | "manager" | "attendant";

const PERMISSIONS: Record<string, Role[]> = {
  "settings.view": ["admin"],
  "settings.team": ["admin"],
  "settings.whatsapp": ["admin"],
  "settings.ai": ["admin", "manager"],
  "conversations.assign": ["admin", "manager"],
  "conversations.close": ["admin", "manager", "attendant"],
  "conversations.view": ["admin", "manager", "attendant"],
  "contacts.create": ["admin", "manager", "attendant"],
  "contacts.edit": ["admin", "manager"],
  "contacts.delete": ["admin"],
  "products.manage": ["admin", "manager"],
  "templates.manage": ["admin", "manager"],
  "analytics.view": ["admin", "manager"],
  "knowledge-base.manage": ["admin", "manager"],
  "audit-log.view": ["admin"],
};

export function hasPermission(role: Role, permission: string): boolean {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function canAccess(role: Role, path: string): boolean {
  if (path.startsWith("/settings/team")) return hasPermission(role, "settings.team");
  if (path.startsWith("/settings")) return hasPermission(role, "settings.view");
  if (path.startsWith("/analytics")) return hasPermission(role, "analytics.view");
  return true;
}
