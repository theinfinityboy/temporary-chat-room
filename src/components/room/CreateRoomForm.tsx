import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIdentityStore } from "@/stores/useIdentityStore";
import { generateRoomId } from "@/lib/room";
import { validateDisplayName } from "@/lib/user";
import { DisplayNameInput } from "./DisplayNameInput";

interface CreateRoomFormProps {
  name: string;
  onNameChange: (value: string) => void;
}

/** Creates a room id locally and navigates to it. No server involved. */
export function CreateRoomForm({ name, onNameChange }: CreateRoomFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validateDisplayName(name);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    useIdentityStore.getState().setDisplayName(name);
    void navigate(`/room/${generateRoomId()}`);
  };

  return (
    <form aria-label="Create a room" onSubmit={submit} className="space-y-3">
      <DisplayNameInput
        id="create-name"
        value={name}
        error={error}
        onChange={(value) => {
          onNameChange(value);
          if (error) setError(null);
        }}
      />
      <Button type="submit" className="w-full">
        <Plus aria-hidden="true" />
        Create room
      </Button>
      <p className="text-xs text-muted-foreground">
        A random 6-character code is generated in your browser. No account needed.
      </p>
    </form>
  );
}
