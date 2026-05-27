export function apiError(err: any, fallback: string): string {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  return typeof m === 'string' ? m : fallback;
}
