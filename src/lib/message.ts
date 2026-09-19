/** Message validation and formatting. Messages are untrusted input. */

export const MAX_MESSAGE_LENGTH = 1000;

/** Human-readable validation error, or null when the content can be sent. */
export function validateMessageContent(input: string): string | null {
  if (input.trim().length === 0) {
    return "Write something first.";
  }
  if (input.trim().length > MAX_MESSAGE_LENGTH) {
    return `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`;
  }
  return null;
}

/** Time as HH:MM in the viewer's locale. */
export function formatMessageTime(createdAt: number): string {
  return new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Full date + time for the <time> tooltip / screen readers. */
export function formatMessageDateTime(createdAt: number): string {
  return new Date(createdAt).toLocaleString();
}
