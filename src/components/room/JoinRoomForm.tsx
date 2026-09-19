import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdentityStore } from "@/stores/useIdentityStore";
import { normalizeRoomId, ROOM_CODE_LENGTH, validateRoomId } from "@/lib/room";
import { validateDisplayName } from "@/lib/user";
import { DisplayNameInput } from "./DisplayNameInput";

interface JoinRoomFormProps {
  name: string;
  onNameChange: (value: string) => void;
}

/** Validates a room code locally, then navigates to it. */
export function JoinRoomForm({ name, onNameChange }: JoinRoomFormProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const badName = validateDisplayName(name);
    const badCode = validateRoomId(code);
    setNameError(badName);
    setCodeError(badCode);
    if (badName || badCode) return;
    useIdentityStore.getState().setDisplayName(name);
    void navigate(`/room/${code.trim().toUpperCase()}`);
  };

  return (
    <form aria-label="Join a room" onSubmit={submit} className="space-y-3">
      <DisplayNameInput
        id="join-name"
        value={name}
        error={nameError}
        onChange={(value) => {
          onNameChange(value);
          if (nameError) setNameError(null);
        }}
      />
      <div>
        <label htmlFor="join-code" className="mb-1.5 block text-sm font-medium">
          Room code
        </label>
        <Input
          id="join-code"
          value={code}
          autoComplete="off"
          spellCheck={false}
          placeholder="X7K29P"
          maxLength={ROOM_CODE_LENGTH + 2}
          aria-invalid={codeError !== null}
          aria-describedby={codeError ? "join-code-error" : undefined}
          className="font-mono uppercase tracking-widest"
          onChange={(event) => {
            setCode(normalizeRoomId(event.target.value));
            if (codeError) setCodeError(null);
          }}
        />
        {codeError && (
          <p id="join-code-error" role="alert" className="mt-1 text-xs text-destructive">
            {codeError}
          </p>
        )}
      </div>
      <Button type="submit" variant="outline" className="w-full">
        Join room
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  );
}
