import { parseRedirectUrl } from '@qubic-connect/core';

export function resolvePaymentUrl(value: string, debugHost?: string): string {
  const url = parseRedirectUrl(value);
  if (!debugHost) return url.href;

  const debugUrl = parseRedirectUrl(debugHost);
  if (debugUrl.href !== `${debugUrl.origin}/`) {
    throw new Error('Invalid debug payment origin');
  }
  debugUrl.pathname = url.pathname;
  debugUrl.search = url.search;
  return debugUrl.href;
}
