import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Hint } from "@/components/ui/tooltip";
import { RoomShareButton } from "./RoomShareButton";

interface RoomInfoProps {
  roomId: string;
  participantCount: number;
  messageCount: number;
  onShare: () => Promise<boolean>;
}

/** Read-only room facts: code, occupancy, and the ephemerality promise. */
export function RoomInfo({ roomId, participantCount, messageCount, onShare }: RoomInfoProps) {
  return (
    <Dialog>
      <Hint label="About this room">
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="About this room">
            <Info aria-hidden="true" />
          </Button>
        </DialogTrigger>
      </Hint>
      <DialogContent>
        <DialogTitle>Room {roomId}</DialogTitle>
        <DialogDescription>
          A temporary space. Everything here disappears when everyone leaves.
        </DialogDescription>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Room code</dt>
            <dd className="font-mono font-semibold tracking-widest">{roomId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Participants</dt>
            <dd>{participantCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Messages in memory</dt>
            <dd>{messageCount}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Saved anywhere</dt>
            <dd>Never</dd>
          </div>
        </dl>
        <div className="mt-4">
          <RoomShareButton onShare={onShare} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
