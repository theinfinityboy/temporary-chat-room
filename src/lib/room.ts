/** Room-code helpers. Codes are short, uppercase, and unambiguous. */

export const ROOM_CODE_LENGTH = 6;

/** Crockford-style alphabet without confusable characters (no I, L, O, 0, 1). */
const ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

/** Generate a random 6-character room code using a CSPRNG. */
export function generateRoomId(): string {
  const bytes = new Uint32Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += ROOM_ALPHABET[byte % ROOM_ALPHABET.length];
  }
  return code;
}

/** Trim, uppercase, and strip anything that is not A-Z/0-9. */
export function normalizeRoomId(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ROOM_CODE_LENGTH);
}

/** True when the value is exactly a valid room code. */
export function isValidRoomId(input: string): boolean {
  return ROOM_CODE_PATTERN.test(input.trim().toUpperCase());
}

/** Human-readable validation error, or null when the code is usable. */
export function validateRoomId(input: string): string | null {
  if (input.trim().length === 0) {
    return "Enter a room code.";
  }
  if (!isValidRoomId(input)) {
    return `Room codes are ${ROOM_CODE_LENGTH} letters or numbers (e.g. X7K29P).`;
  }
  return null;
}
