export const TZ_OFFSET_HOURS = -5; // Bogotá UTC-5

function bogotaNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + TZ_OFFSET_HOURS * 60 * 60 * 1000);
}

export function todayRangeUTC(): { start: string; end: string } {
  const b = bogotaNow();
  const y = b.getUTCFullYear();
  const m = b.getUTCMonth();
  const d = b.getUTCDate();
  const start = new Date(Date.UTC(y, m, d) - TZ_OFFSET_HOURS * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function todayLabel(): string {
  const b = bogotaNow();
  return b.toISOString().slice(0, 10);
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(iso));
}
