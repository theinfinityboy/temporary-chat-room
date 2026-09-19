/** Core chat data model. Everything here is ephemeral (in-memory only). */

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  /** Plain text. Always rendered as text, never as HTML. */
  content: string;
  createdAt: number;
}

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

/** What the UI hands to the transport when sending. */
export interface SendMessageInput {
  roomId: string;
  content: string;
}

export type PresenceEventType = "join" | "leave" | "update";

export interface PresenceEvent {
  type: PresenceEventType;
  participant: {
    id: string;
    displayName: string;
    joinedAt: number;
    isMuted: boolean;
    hasVideo: boolean;
  };
}
