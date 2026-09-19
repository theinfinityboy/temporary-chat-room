import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { useParticipantsView } from "@/hooks/useParticipants";
import { useRoom } from "@/hooks/useRoom";
import { getChatTransport } from "@/services/chat/transport";
import { useIdentity, useIdentityStore } from "@/stores/useIdentityStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { isValidRoomId } from "@/lib/room";
import { validateDisplayName } from "@/lib/user";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { ParticipantList } from "@/components/chat/ParticipantList";
import { CallControls } from "@/components/media/CallControls";
import { DisplayNameInput } from "@/components/room/DisplayNameInput";
import { RoomInfo } from "@/components/room/RoomInfo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

/**
 * /room/:roomId. Desktop shows a sidebar; mobile moves participants into a
 * sheet. Everything on this page is ephemeral.
 */
export default function RoomPage() {
  const { roomId: rawRoomId } = useParams();
  const normalized = (rawRoomId ?? "").trim().toUpperCase();
  const roomId = isValidRoomId(normalized) ? normalized : null;

  const user = useIdentity();
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  const activeRoomId = roomId && user ? roomId : null;
  const { connection, roomError, leave, shareRoom } = useRoom(activeRoomId);
  const { messages, messageCount, sendMessage } = useChat(activeRoomId);
  const { participants, count } = useParticipantsView(activeRoomId);
  const isLiveSync = getChatTransport().kind === "websocket";

  if (!roomId) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4">
        <Alert variant="destructive">
          That room link looks invalid. Room codes are 6 letters or numbers.
        </Alert>
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (!user) {
    return <NameGate roomId={roomId} />;
  }

  const composerDisabled = connection !== "connected";
  const disabledReason =
    connection === "connected" ? "" : "Connecting… you can send in a moment.";

  const handleShare = async () => {
    const ok = await shareRoom();
    if (ok) {
      toast.success("Invite link copied");
    } else {
      toast.error("Could not copy the link", {
        description: "Copy the URL from your address bar instead.",
      });
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <ChatHeader
        roomId={roomId}
        participantCount={count}
        connection={connection}
        onShare={() => void handleShare()}
        onLeave={leave}
        onOpenParticipants={() => setParticipantsOpen(true)}
      />

      {bannerVisible && (
        <div className="border-b bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p>
              {isLiveSync
                ? "Live — messages sync across browsers via WebSocket."
                : "Local preview — messages stay in this browser. Real multi-user sync needs a WebSocket server."}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setBannerVisible(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {roomError && (
        <div className="border-b px-3 py-2">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <Alert variant="destructive" className="flex-1">
              {roomError}
            </Alert>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 shrink-0 px-2 text-xs"
              onClick={() => useRoomStore.getState().setError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1">
        <aside
          aria-label="Participants and call controls"
          className="hidden w-64 shrink-0 flex-col border-r lg:flex"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <h2 className="text-sm font-semibold">Participants</h2>
            <RoomInfo
              roomId={roomId}
              participantCount={count}
              messageCount={messageCount}
              onShare={shareRoom}
            />
          </div>
          <div className="min-h-0 flex-1">
            <ParticipantList participants={participants} selfId={user.id} />
          </div>
          <div className="border-t p-3">
            <CallControls roomId={roomId} selfId={user.id} />
          </div>
        </aside>

        <main aria-label="Chat" className="flex min-w-0 flex-1 flex-col">
          <ChatMessageList messages={messages} selfId={user.id} />
          <MessageComposer
            onSend={sendMessage}
            disabled={composerDisabled}
            disabledReason={disabledReason}
          />
        </main>
      </div>

      <Sheet open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <SheetContent aria-describedby={undefined}>
          <SheetTitle>Participants ({count})</SheetTitle>
          <div className="min-h-0 flex-1">
            <ParticipantList participants={participants} selfId={user.id} />
          </div>
          <div className="border-t pt-3">
            <CallControls roomId={roomId} selfId={user.id} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Inline gate: a display name is required before entering any room. */
function NameGate({ roomId }: { roomId: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validateDisplayName(name);
    if (invalid) {
      setError(invalid);
      return;
    }
    useIdentityStore.getState().setDisplayName(name);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
      <form
        aria-label={`Choose a name to enter room ${roomId}`}
        onSubmit={submit}
        className="space-y-4 rounded-lg border p-5"
      >
        <div>
          <h1 className="text-lg font-semibold">
            Join room <span className="font-mono tracking-widest">{roomId}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a temporary name. It is only visible in this room.
          </p>
        </div>
        <DisplayNameInput
          id="gate-name"
          value={name}
          error={error}
          onChange={(value) => {
            setName(value);
            if (error) setError(null);
          }}
        />
        <Button type="submit" className="w-full">
          Enter room
        </Button>
      </form>
    </div>
  );
}
