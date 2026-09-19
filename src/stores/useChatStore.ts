import { create } from "zustand";
import type { ChatMessage } from "@/types/chat";

/** Cap per-room history: rooms are ephemeral, lists stay cheap to render. */
export const MAX_MESSAGES_PER_ROOM = 200;

/** Shared empty reference so selectors never return a fresh array. */
export const EMPTY_MESSAGES: ChatMessage[] = [];

interface ChatState {
  messagesByRoom: Record<string, ChatMessage[]>;
  addMessage: (message: ChatMessage) => void;
  clearRoomMessages: (roomId: string) => void;
  clearAllMessages: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messagesByRoom: {},
  addMessage: (message) =>
    set((state) => {
      const existing = state.messagesByRoom[message.roomId] ?? EMPTY_MESSAGES;
      if (existing.some((m) => m.id === message.id)) return state;
      const next = [...existing, message].slice(-MAX_MESSAGES_PER_ROOM);
      return { messagesByRoom: { ...state.messagesByRoom, [message.roomId]: next } };
    }),
  clearRoomMessages: (roomId) =>
    set((state) => {
      if (!(roomId in state.messagesByRoom)) return state;
      const next = { ...state.messagesByRoom };
      delete next[roomId];
      return { messagesByRoom: next };
    }),
  clearAllMessages: () => set({ messagesByRoom: {} }),
}));

/** Selector: messages for one room (stable empty reference when none). */
export function useMessages(roomId: string | null): ChatMessage[] {
  return useChatStore((state) =>
    roomId ? (state.messagesByRoom[roomId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES,
  );
}
