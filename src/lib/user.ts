/** Temporary client-side identity. No accounts, no passwords, no persistence. */

export const DISPLAY_NAME_MAX_LENGTH = 24;

/** Collapse whitespace and trim. */
export function normalizeDisplayName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/** Human-readable validation error, or null when the name is usable. */
export function validateDisplayName(input: string): string | null {
  const name = normalizeDisplayName(input);
  if (name.length === 0) {
    return "Enter a display name.";
  }
  if (name.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Keep it under ${DISPLAY_NAME_MAX_LENGTH} characters.`;
  }
  return null;
}

/** Random per-tab user id. Regenerated on every page load. */
export function createTempUserId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
