import type {
  ChatMessage,
  ConnectionState,
  PresenceEvent,
  SendMessageInput,
} from "@/types/chat";
import type { TempUser } from "@/types/room";

/**
 * Transport abstraction between the app and the network.
 *
 * The UI and Zustand stores only ever talk to this interface — never to a
 * concrete transport. Today the factory returns {@link MockChatTransport};
 * later it can return a WebSocket implementation without touching any
 * component, hook, or store.
 */
export interface ChatTransport {
  readonly kind: "mock" | "websocket";

  /** Open the (real or simulated) connection for a room. */
  connect(roomId: string, user: TempUser): Promise<void>;

  /** Close the connection and release timers/sockets. */
  disconnect(): void;

  /** Publish a message. The transport echoes/confirms it via onMessage. */
  sendMessage(input: SendMessageInput): void;

  /** Subscribe to incoming messages. Returns an unsubscribe function. */
  onMessage(callback: (message: ChatMessage) => void): () => void;

  /** Subscribe to join/leave/update presence events. */
  onPresence(callback: (event: PresenceEvent) => void): () => void;

  /** Subscribe to connection-state changes. */
  onStatus(callback: (status: ConnectionState) => void): () => void;
}
