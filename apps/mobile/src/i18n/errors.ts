import i18n from './index';

/**
 * The message to show for a failed request: a translation when the error carries a known
 * `reason`, otherwise the server's message, otherwise a generic translated message.
 */
export function errorText(e: unknown, fallback?: string): string {
  const reason = (e as { reason?: string } | null)?.reason;
  const key = `common:errors.${reason}`;
  if (reason && i18n.exists(key)) return i18n.t(key as 'common:errors.unknown');
  if (e instanceof Error && e.message) return e.message;
  return fallback ?? i18n.t('common:errors.unknown');
}
