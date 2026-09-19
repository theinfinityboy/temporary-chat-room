import type { ConnectionState } from "@/types/chat";
import { cn } from "@/lib/utils";

const LABELS: Record<ConnectionState, { text: string; dot: string }> = {
  idle: { text: "Idle", dot: "bg-muted-foreground" },
  connecting: { text: "Connecting…", dot: "bg-amber-500" },
  connected: { text: "Connected", dot: "bg-emerald-500" },
  reconnecting: { text: "Reconnecting…", dot: "bg-amber-500" },
  disconnected: { text: "Disconnected", dot: "bg-muted-foreground" },
  error: { text: "Connection error", dot: "bg-destructive" },
};

/** Presence/connection indicator. Text + dot, announced to screen readers. */
export function ConnectionStatus({ connection }: { connection: ConnectionState }) {
  const { text, dot } = LABELS[connection];
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
      {text}
    </span>
  );
}
