// Shared utility functions — do NOT duplicate these across screens

/**
 * Returns up to 2 uppercase initials from a full name.
 * @param {string} name
 * @param {string} [fallback='?']
 */
export function getUserInitials(name, fallback = '?') {
  if (!name) return fallback;
  return name
    .split(' ')
    .map(x => x[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Formats an ISO datetime string to Turkish locale date + time.
 * e.g. "29.04.2026 14:35"
 * @param {string|null} dt
 */
export function getTimeStr(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return (
    d.toLocaleDateString('tr-TR') +
    ' ' +
    d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  );
}

/**
 * Formats an ISO datetime string to HH:MM only.
 * @param {string|null} dt
 */
export function getShortTimeStr(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
