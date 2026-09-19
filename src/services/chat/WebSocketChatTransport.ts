import type {
  ChatMessage,
  ConnectionState,
  PresenceEvent,
  SendMessageInput,
} from "@/types/chat";
import type { TempUser } from "@/types/room";
import type { ChatTransport } from "./ChatTransport";

/**
 * WebSocket transport for real multi-user sync.
 *
 * Active when VITE_WS_URL is set (see getChatTransport()); otherwise the app
 * falls back to MockChatTransport.
 *
 * Wire protocol (JSON text frames, client ↔ server):
 * - client → server: { type: "join", roomId, user: { id, displayName } }
 * - client → server: { type: "message", roomId, content }
 * - client → server: { type: "leave", roomId }
 * - server → client: { type: "message", message: ChatMessage }
 * - server → client: { type: "presence", event: PresenceEvent }
 *
 * The server owns ids, timestamps, and history fan-out; the client only
 * renders what the socket delivers. To adopt it, return an instance from
 * getChatTransport() based on configuration — no UI/store/hook changes.
 */
export class WebSocketChatTransport implements ChatTransport {
  readonly kind = "websocket" as const;

  private socket: WebSocket | null = null;
  private roomId: string | null = null;
  private readonly messageListeners = new Set<(m: ChatMessage) => void>();
  private readonly presenceListeners = new Set<(e: PresenceEvent) => void>();
  private readonly statusListeners = new Set<(s: ConnectionState) => void>();
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(roomId: string, user: TempUser): Promise<void> {
    this.disconnect();
    this.roomId = roomId;
    this.setStatus("connecting");

    return new Promise((resolve, reject) => {
      let socket: WebSocket;
      try {
        socket = new WebSocket(this.url);
      } catch (error) {
        this.setStatus("error");
        reject(error instanceof Error ? error : new Error("Failed to open socket"));
        return;
      }
      this.socket = socket;

      socket.addEventListener("open", () => {
        if (this.socket !== socket) {
          // Superseded by disconnect() (e.g. StrictMode remount): don't resurrect.
          try {
            socket.close();
          } catch {
            // Ignore close errors on a superseded socket.
          }
          return;
        }
        socket.send(JSON.stringify({ type: "join", roomId, user }));
        this.setStatus("connected");
        resolve();
      });
      socket.addEventListener("message", (event) => {
        this.handleFrame(String(event.data));
      });
      socket.addEventListener("close", () => {
        if (this.socket === socket) {
          this.socket = null;
          this.setStatus("disconnected");
        }
      });
      socket.addEventListener("error", () => {
        this.setStatus("error");
        reject(new Error("WebSocket connection failed"));
      });
    });
  }

  disconnect(): void {
    if (this.roomId && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "leave", roomId: this.roomId }));
    }
    this.socket?.close();
    this.socket = null;
    this.roomId = null;
    this.setStatus("disconnected");
  }

  sendMessage(input: SendMessageInput): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({ type: "message", roomId: input.roomId, content: input.content }),
    );
  }

  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  onPresence(callback: (event: PresenceEvent) => void): () => void {
    this.presenceListeners.add(callback);
    return () => {
      this.presenceListeners.delete(callback);
    };
  }

  onStatus(callback: (status: ConnectionState) => void): () => void {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private handleFrame(raw: string): void {
    let frame: unknown;
    try {
      frame = JSON.parse(raw);
    } catch {
      return;
    }
    if (typeof frame !== "object" || frame === null || !("type" in frame)) return;
    const typed = frame as { type: string; message?: ChatMessage; event?: PresenceEvent };
    if (typed.type === "message" && typed.message) {
      for (const listener of this.messageListeners) listener(typed.message);
    } else if (typed.type === "presence" && typed.event) {
      for (const listener of this.presenceListeners) listener(typed.event);
    }
  }

  private setStatus(status: ConnectionState): void {
    for (const listener of this.statusListeners) listener(status);
  }
}
