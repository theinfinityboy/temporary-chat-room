import { describe, expect, it, vi } from "vitest";
import type { ChatMessage, ConnectionState } from "@/types/chat";
import { MockChatTransport } from "./MockChatTransport";

const USER = { id: "u1", displayName: "Alex" };

describe("MockChatTransport", () => {
  it("moves through connecting → connected on connect", async () => {
    const transport = new MockChatTransport({ connectDelayMs: 5, echoDelayMs: 5 });
    const statuses: ConnectionState[] = [];
    transport.onStatus((s) => statuses.push(s));

    await transport.connect("X7K29P", USER);
    expect(statuses).toEqual(["connecting", "connected"]);
    transport.disconnect();
  });

  it("announces the joining user as presence", async () => {
    const transport = new MockChatTransport({ connectDelayMs: 5, echoDelayMs: 5 });
    const seen = new Promise((resolve) => {
      transport.onPresence((event) => resolve(event));
    });
    await transport.connect("X7K29P", USER);
    await expect(seen).resolves.toMatchObject({
      type: "join",
      participant: { id: "u1", displayName: "Alex" },
    });
    transport.disconnect();
  });

  it("echoes sent messages back to subscribers", async () => {
    const transport = new MockChatTransport({ connectDelayMs: 5, echoDelayMs: 5 });
    await transport.connect("X7K29P", USER);
    const received = new Promise<ChatMessage>((resolve) => {
      transport.onMessage((message) => resolve(message));
    });
    transport.sendMessage({ roomId: "X7K29P", content: "hello" });
    await expect(received).resolves.toMatchObject({
      roomId: "X7K29P",
      senderId: "u1",
      senderName: "Alex",
      content: "hello",
    });
    transport.disconnect();
  });

  it("supports unsubscribe and stops echoing after disconnect", async () => {
    const transport = new MockChatTransport({ connectDelayMs: 5, echoDelayMs: 20 });
    await transport.connect("X7K29P", USER);
    const listener = vi.fn();
    const off = transport.onMessage(listener);
    off();
    transport.disconnect();
    transport.sendMessage({ roomId: "X7K29P", content: "dropped" });
    await new Promise((r) => setTimeout(r, 40));
    expect(listener).not.toHaveBeenCalled();
  });
});
