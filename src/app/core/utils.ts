import { HttpErrorResponse } from '@angular/common/http';

// turns whatever the API (or the network) gave us into one readable line
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server';

    const body = err.error as { message?: string; errors?: Record<string, string[]> } | null;
    if (body?.errors) {
      const [field, messages] = Object.entries(body.errors)[0] ?? [];
      if (field && messages?.[0]) return `${field}: ${messages[0]}`;
    }
    if (body?.message) return body.message;
  }
  return 'Something went wrong';
}

export function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}