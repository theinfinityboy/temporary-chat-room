import { beforeEach, describe, expect, it } from "vitest";
import type { ChatMessage } from "@/types/chat";
import {
  MAX_MESSAGES_PER_ROOM,
  useChatStore,
} from "@/stores/useChatStore";
import { useParticipantStore } from "@/stores/useParticipantStore";
import { useRoomStore } from "@/stores/useRoomStore";

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: `m-${Math.random().toString(36).slice(2)}`,
    roomId: "X7K29P",
    senderId: "u1",
    senderName: "Alex",
    content: "hello",
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  useChatStore.setState({ messagesByRoom: {} });
  useParticipantStore.setState({ participantsByRoom: {} });
  useRoomStore.setState({ room: null, connection: "idle", error: null });
});

describe("useChatStore", () => {
  it("adds messages scoped to their room", () => {
    const store = useChatStore.getState();
    store.addMessage(makeMessage({ id: "a", content: "one" }));
    store.addMessage(makeMessage({ id: "b", roomId: "OTHER1", content: "other" }));

    expect(useChatStore.getState().messagesByRoom["X7K29P"]).toHaveLength(1);
    expect(useChatStore.getState().messagesByRoom["OTHER1"]).toHaveLength(1);
  });

  it("ignores duplicate message ids", () => {
    const store = useChatStore.getState();
    store.addMessage(makeMessage({ id: "dup" }));
    store.addMessage(makeMessage({ id: "dup" }));
    expect(useChatStore.getState().messagesByRoom["X7K29P"]).toHaveLength(1);
  });

  it("caps history per room and clears on leave", () => {
    const store = useChatStore.getState();
    for (let i = 0; i < MAX_MESSAGES_PER_ROOM + 50; i++) {
      store.addMessage(makeMessage({ id: `m${i}` }));
    }
    expect(useChatStore.getState().messagesByRoom["X7K29P"]).toHaveLength(
      MAX_MESSAGES_PER_ROOM,
    );
    store.clearRoomMessages("X7K29P");
    expect(useChatStore.getState().messagesByRoom["X7K29P"]).toBeUndefined();
  });
});

describe("useParticipantStore", () => {
  it("upserts, updates media, and removes participants", () => {
    const store = useParticipantStore.getState();
    store.upsertParticipant("X7K29P", {
      id: "u1",
      displayName: "Alex",
      joinedAt: 1,
      isMuted: false,
      hasVideo: false,
    });
    store.upsertParticipant("X7K29P", {
      id: "u1",
      displayName: "Alex R.",
      joinedAt: 1,
      isMuted: false,
      hasVideo: false,
    });
    expect(useParticipantStore.getState().participantsByRoom["X7K29P"]).toHaveLength(1);
    expect(
      useParticipantStore.getState().participantsByRoom["X7K29P"]?.[0]?.displayName,
    ).toBe("Alex R.");

    store.updateParticipantMedia("X7K29P", "u1", { isMuted: true, hasVideo: false });
    expect(
      useParticipantStore.getState().participantsByRoom["X7K29P"]?.[0]?.isMuted,
    ).toBe(true);

    store.removeParticipant("X7K29P", "u1");
    expect(useParticipantStore.getState().participantsByRoom["X7K29P"]).toHaveLength(0);
  });
});

describe("useRoomStore", () => {
  it("joins, tracks connection, and resets on leave", () => {
    const store = useRoomStore.getState();
    store.joinRoom("X7K29P");
    expect(useRoomStore.getState().room?.id).toBe("X7K29P");

    store.setConnection("connected");
    expect(useRoomStore.getState().connection).toBe("connected");

    store.leaveRoom();
    expect(useRoomStore.getState().room).toBeNull();
    expect(useRoomStore.getState().connection).toBe("idle");
  });
});
