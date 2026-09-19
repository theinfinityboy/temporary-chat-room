import type { ChatTransport } from "./ChatTransport";
import { MockChatTransport } from "./MockChatTransport";
import { WebSocketChatTransport } from "./WebSocketChatTransport";

let instance: ChatTransport | null = null;
let instanceUrl: string | null = null;
let pinned = false;

/**
 * Single access point for the chat network layer.
 *
 * Components, hooks, and stores import this factory — never a concrete
 * transport class. To switch to real multi-user networking, return a
 * WebSocketChatTransport here (e.g. when VITE_WS_URL is configured).
 */
export function getChatTransport(): ChatTransport {
  const url = import.meta.env.VITE_WS_URL as string | undefined;
  if (!instance) {
    instance = url ? new WebSocketChatTransport(url) : new MockChatTransport();
    instanceUrl = url ?? null;
  } else if (!pinned && (url ?? null) !== instanceUrl) {
    // Config changed (e.g. HMR with a new .env): recreate so the kind follows config.
    try {
      instance.disconnect();
    } catch {
      // Ignore cleanup errors when swapping implementations.
    }
    instance = url ? new WebSocketChatTransport(url) : new MockChatTransport();
    instanceUrl = url ?? null;
  }
  return instance;
}

/** Test-only escape hatch to swap the singleton transport. */
export function setChatTransport(transport: ChatTransport | null): void {
  instance = transport;
  instanceUrl = null;
  pinned = transport !== null;
}
