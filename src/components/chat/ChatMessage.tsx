import { memo } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { formatMessageDateTime, formatMessageTime } from "@/lib/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? (parts[1]?.[0] ?? "") : "";
  return (first + second).toUpperCase();
}

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

/**
 * One message bubble. Memoized so new messages only render the new row.
 * Content is rendered as plain text — React escapes it, so HTML in messages
 * can never execute.
 */
export const ChatMessage = memo(function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <article
      aria-label={`${message.senderName} at ${formatMessageTime(message.createdAt)}: ${message.content}`}
      className={cn("message-item flex gap-2.5 px-4 py-2", isOwn && "flex-row-reverse")}
    >
      <Avatar aria-hidden="true" className="mt-0.5">
        <AvatarFallback>{initials(message.senderName)}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[75%] space-y-0.5", isOwn && "text-right")}>
        <div
          className={cn(
            "flex items-baseline gap-2",
            isOwn ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="text-xs font-medium">{message.senderName}</span>
          <time
            dateTime={new Date(message.createdAt).toISOString()}
            title={formatMessageDateTime(message.createdAt)}
            className="text-[11px] text-muted-foreground"
          >
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
        <p
          className={cn(
            "inline-block whitespace-pre-wrap break-words rounded-lg px-3 py-1.5 text-left text-sm",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {message.content}
        </p>
      </div>
    </article>
  );
});
