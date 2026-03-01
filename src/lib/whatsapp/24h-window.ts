export type WindowStatus = "open" | "warning" | "critical" | "closed";

export function getWindowStatus(windowExpiresAt: Date | null): WindowStatus {
  if (!windowExpiresAt) return "closed";
  const now = new Date();
  const expiry = new Date(windowExpiresAt);
  const hoursRemaining = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursRemaining <= 0) return "closed";
  if (hoursRemaining <= 1) return "critical";
  if (hoursRemaining <= 4) return "warning";
  return "open";
}

export function isWithinWindow(windowExpiresAt: Date | null): boolean {
  return getWindowStatus(windowExpiresAt) !== "closed";
}

export function getRemainingTime(windowExpiresAt: Date | null): { hours: number; minutes: number } | null {
  if (!windowExpiresAt) return null;
  const remaining = new Date(windowExpiresAt).getTime() - Date.now();
  if (remaining <= 0) return null;
  return {
    hours: Math.floor(remaining / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
  };
}

export function calculateWindowExpiry(lastUserMessageAt: Date): Date {
  return new Date(lastUserMessageAt.getTime() + 24 * 60 * 60 * 1000);
}
