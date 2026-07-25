export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
