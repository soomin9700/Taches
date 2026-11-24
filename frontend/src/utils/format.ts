export function formatDuree(minutes: number): string {
  const m = Math.round(minutes || 0);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const reste = m % 60;
  return reste > 0 ? `${h}h ${reste}m` : `${h}h`;
}

export function formatChrono(secondes: number): string {
  const min = Math.floor(secondes / 60).toString().padStart(2, '0');
  const sec = (secondes % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export function aujourdHuiISO(): string {
  return new Date().toISOString().split('T')[0];
}