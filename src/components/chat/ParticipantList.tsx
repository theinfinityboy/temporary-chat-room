import { MicOff, Users, VideoOff } from "lucide-react";
import type { Participant } from "@/types/room";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

interface ParticipantListProps {
  participants: Participant[];
  selfId: string | null;
}

/** Presence roster. Media icons always pair with text, never color alone. */
export function ParticipantList({ participants, selfId }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <Users className="size-7 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Nobody here yet.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <ul aria-label="Participants" className="space-y-1 p-2">
        {participants.map((participant) => {
          const isSelf = participant.id === selfId;
          return (
            <li
              key={participant.id}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
            >
              <span
                aria-hidden="true"
                title={isSelf ? "You are here" : `${participant.displayName} is here`}
                className="size-2 shrink-0 rounded-full bg-emerald-500"
              />
              <Avatar className="size-7">
                <AvatarFallback>{initials(participant.displayName)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm">
                {participant.displayName}
              </span>
              {isSelf && <Badge variant="outline">You</Badge>}
              {participant.isMuted && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MicOff className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Muted</span>
                </span>
              )}
              {participant.hasVideo && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <VideoOff className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Video off</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
