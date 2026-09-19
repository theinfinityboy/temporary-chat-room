import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { MockChatTransport } from "@/services/chat/MockChatTransport";
import { setChatTransport } from "@/services/chat/transport";

beforeEach(() => {
  // Tests must never dial the real relay: .env sets VITE_WS_URL locally,
  // and RoomPage mounts useRoom which connects on render.
  setChatTransport(new MockChatTransport({ connectDelayMs: 0, echoDelayMs: 0 }));
});

afterEach(() => {
  cleanup();
  setChatTransport(null);
});
