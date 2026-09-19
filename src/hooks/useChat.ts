import { useCallback } from "react";
import { useChatStore, useMessages } from "@/stores/useChatStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { getChatTransport } from "@/services/chat/transport";
import { validateMessageContent } from "@/lib/message";

/**
 * Message flow: validate → transport → (echo) → store → list.
 * Returns an error string when the message cannot be sent, else null.
 */
export function useChat(roomId: string | null) {
  const messages = useMessages(roomId);

  const sendMessage = useCallback(
    (content: string): string | null => {
      const invalid = validateMessageContent(content);
      if (invalid) return invalid;
      if (!roomId) return "Join a room first.";
      if (useRoomStore.getState().connection !== "connected") {
        return "Still connecting — try again in a moment.";
      }
      getChatTransport().sendMessage({ roomId, content: content.trim() });
      return null;
    },
    [roomId],
  );

  const messageCount = useChatStore((state) =>
    roomId ? (state.messagesByRoom[roomId]?.length ?? 0) : 0,
  );

  return { messages, messageCount, sendMessage };
}
