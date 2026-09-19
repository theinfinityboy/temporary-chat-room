import { useState } from "react";
import { Link2, MessagesSquare, Timer, UserX } from "lucide-react";
import { useIdentityStore } from "@/stores/useIdentityStore";
import { CreateRoomForm } from "@/components/room/CreateRoomForm";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

const PROMISES = [
  { icon: UserX, text: "No accounts, no sign-up — just a temporary name." },
  { icon: Timer, text: "No history — messages vanish when everyone leaves." },
  { icon: Link2, text: "Shareable links — anyone with the code can join." },
];

/** Landing page: create a room or join one with a code. */
export default function HomePage() {
  const [name, setName] = useState(
    () => useIdentityStore.getState().user?.displayName ?? "",
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <MessagesSquare className="size-4" aria-hidden="true" />
          Temporary Chat Room
        </p>
        <ThemeToggle />
      </header>

      <main id="main" className="flex flex-1 flex-col justify-center gap-6 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Rooms that disappear.
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a temporary chat room, share the link, talk, and leave nothing
            behind.
          </p>
        </div>

        <section aria-labelledby="create-heading" className="rounded-lg border p-4">
          <h2 id="create-heading" className="mb-3 text-sm font-semibold">
            Create a room
          </h2>
          <CreateRoomForm name={name} onNameChange={setName} />
        </section>

        <div className="flex items-center gap-3" aria-hidden="true">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <section aria-labelledby="join-heading" className="rounded-lg border p-4">
          <h2 id="join-heading" className="mb-3 text-sm font-semibold">
            Join a room
          </h2>
          <JoinRoomForm name={name} onNameChange={setName} />
        </section>

        <ul className="space-y-2">
          {PROMISES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        Local preview — rooms live in this browser tab until a server is connected.
      </footer>
    </div>
  );
}
