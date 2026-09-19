import { useEffect, useRef } from "react";
import { MessageSquareOff } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  selfId: string | null;
}

/**
 * Scrollable message log. Sticks to the bottom while the user is already
 * there; never yanks scroll position while reading history.
 */
export function ChatMessageList({ messages, selfId }: ChatMessageListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const el = viewportRef.current;
    if (el && stickRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <MessageSquareOff className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">No messages yet</p>
        <p className="max-w-60 text-xs text-muted-foreground">
          Say hello — messages stay in memory and disappear when everyone leaves.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      onScroll={handleScroll}
      role="log"
      aria-label="Chat messages"
      aria-live="off"
      tabIndex={0}
      className="flex-1 overflow-y-auto py-2"
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isOwn={message.senderId === selfId}
        />
      ))}
    </div>
  );
}
