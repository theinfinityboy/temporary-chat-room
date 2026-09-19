import type {
  ChatMessage,
  ConnectionState,
  PresenceEvent,
  SendMessageInput,
} from "@/types/chat";
import type { TempUser } from "@/types/room";
import type { ChatTransport } from "./ChatTransport";

export interface MockTransportOptions {
  connectDelayMs?: number;
  echoDelayMs?: number;
}

/**
 * In-memory transport for UI development and tests.
 *
 * IMPORTANT: this is not real networking. It cannot synchronize independent
 * browsers — each tab gets its own isolated instance. It exists so the full
 * message flow (composer → hook → store → transport → store → list) can be
 * built and tested before a WebSocket backend exists.
 */
export class MockChatTransport implements ChatTransport {
  readonly kind = "mock" as const;

  private readonly connectDelayMs: number;
  private readonly echoDelayMs: number;
  private status: ConnectionState = "idle";
  private roomId: string | null = null;
  private user: TempUser | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly messageListeners = new Set<(m: ChatMessage) => void>();
  private readonly presenceListeners = new Set<(e: PresenceEvent) => void>();
  private readonly statusListeners = new Set<(s: ConnectionState) => void>();
  private counter = 0;

  constructor(options: MockTransportOptions = {}) {
    this.connectDelayMs = options.connectDelayMs ?? 350;
    this.echoDelayMs = options.echoDelayMs ?? 120;
  }

  connect(roomId: string, user: TempUser): Promise<void> {
    this.disconnect();
    this.roomId = roomId;
    this.user = user;
    this.setStatus("connecting");

    return new Promise((resolve) => {
      this.after(this.connectDelayMs, () => {
        // connect() may have been superseded by disconnect(); bail out.
        if (this.roomId !== roomId) return;
        this.setStatus("connected");
        this.emitPresence({
          type: "join",
          participant: {
            id: user.id,
            displayName: user.displayName,
            joinedAt: Date.now(),
            isMuted: false,
            hasVideo: false,
          },
        });
        resolve();
      });
    });
  }

  disconnect(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.roomId = null;
    this.user = null;
    if (this.status === "connected" || this.status === "connecting") {
      this.setStatus("disconnected");
    } else {
      this.status = "disconnected";
    }
  }

  sendMessage(input: SendMessageInput): void {
    if (this.status !== "connected" || !this.user || !this.roomId) return;
    const message: ChatMessage = {
      id: `mock-${Date.now()}-${(this.counter += 1)}`,
      roomId: input.roomId,
      senderId: this.user.id,
      senderName: this.user.displayName,
      content: input.content,
      createdAt: Date.now(),
    };
    // Simulate a network round-trip so UI states (pending → shown) behave
    // the same as they will with a real socket.
    this.after(this.echoDelayMs, () => {
      for (const listener of this.messageListeners) listener(message);
    });
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

  private setStatus(status: ConnectionState): void {
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }

  private emitPresence(event: PresenceEvent): void {
    for (const listener of this.presenceListeners) listener(event);
  }

  private after(ms: number, fn: () => void): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      fn();
    }, ms);
    this.timers.add(timer);
  }
}
