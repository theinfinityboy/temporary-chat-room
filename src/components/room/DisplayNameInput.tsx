import { Input } from "@/components/ui/input";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/user";

interface DisplayNameInputProps {
  id: string;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
}

/** Shared temporary-name field used by both create and join forms. */
export function DisplayNameInput({ id, value, error, onChange }: DisplayNameInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        Display name
      </label>
      <Input
        id={id}
        value={value}
        maxLength={DISPLAY_NAME_MAX_LENGTH + 8}
        autoComplete="nickname"
        placeholder="e.g. Alex"
        aria-invalid={error !== null}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
