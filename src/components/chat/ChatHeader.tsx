import { useState } from "react";
import { LogOut, Share2, Users } from "lucide-react";
import type { ConnectionState } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Hint } from "@/components/ui/tooltip";
import { ConnectionStatus } from "./ConnectionStatus";

interface ChatHeaderProps {
  roomId: string;
  participantCount: number;
  connection: ConnectionState;
  onShare: () => void;
  onLeave: () => void;
  onOpenParticipants: () => void;
}

/** Room top bar: code, presence count, connection, share, leave. */
export function ChatHeader({
  roomId,
  participantCount,
  connection,
  onShare,
  onLeave,
  onOpenParticipants,
}: ChatHeaderProps) {
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  return (
    <header className="flex items-center gap-2 border-b px-3 py-2">
      <Hint label="View participants" side="bottom">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onOpenParticipants}
          aria-label="View participants"
        >
          <Users aria-hidden="true" />
        </Button>
      </Hint>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          Room <span className="font-mono tracking-widest">{roomId}</span>
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" aria-label={`${participantCount} participant${participantCount === 1 ? "" : "s"}`}>
            <Users className="size-3" aria-hidden="true" />
            {participantCount}
          </Badge>
          <ConnectionStatus connection={connection} />
        </div>
      </div>
      <Hint label="Copy invite link" side="bottom">
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 aria-hidden="true" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </Hint>
      <Hint label="Leave room" side="bottom">
        <Button variant="ghost" size="sm" onClick={() => setConfirmingLeave(true)}>
          <LogOut aria-hidden="true" />
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </Hint>

      <Dialog open={confirmingLeave} onOpenChange={setConfirmingLeave}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Leave this room?</DialogTitle>
          <DialogDescription>
            Messages are temporary. Leaving clears them from this device — nothing is
            saved anywhere.
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmingLeave(false)}>
              Stay
            </Button>
            <Button variant="destructive" onClick={onLeave}>
              Leave room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
