import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/lib/message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hint } from "@/components/ui/tooltip";

interface MessageComposerProps {
  /** Sends the message; returns an error string or null on success. */
  onSend: (content: string) => string | null;
  disabled: boolean;
  disabledReason: string;
}

/** Message input. Enter sends, Shift+Enter adds a line. */
export function MessageComposer({ onSend, disabled, disabledReason }: MessageComposerProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const failure = onSend(value);
    if (failure) {
      setError(failure);
      return;
    }
    setError(null);
    setValue("");
    if (areaRef.current) areaRef.current.style.height = "auto";
    areaRef.current?.focus();
  };

  const overLimit = value.trim().length > MAX_MESSAGE_LENGTH;

  return (
    <form
      aria-label="Send a message"
      className="border-t p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="message-input" className="sr-only">
            Message
          </label>
          <Textarea
            id="message-input"
            ref={areaRef}
            rows={1}
            value={value}
            disabled={disabled}
            placeholder={disabled ? disabledReason : "Message…"}
            aria-describedby={error ? "composer-error" : "composer-hint"}
            aria-invalid={error !== null}
            className="max-h-32 resize-none"
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
              const el = event.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
          />
        </div>
        <Hint label="Send message">
          <Button type="submit" size="icon" disabled={disabled} aria-label="Send message">
            <Send aria-hidden="true" />
          </Button>
        </Hint>
      </div>
      <div className="mt-1 flex items-center justify-between px-1">
        <p id={error ? "composer-error" : "composer-hint"} role={error ? "alert" : undefined} className={error || overLimit ? "text-xs text-destructive" : "text-[11px] text-muted-foreground"}>
          {error ?? "Enter to send · Shift+Enter for a new line"}
        </p>
        <span
          aria-label={`${value.trim().length} of ${MAX_MESSAGE_LENGTH} characters used`}
          className={overLimit ? "text-xs text-destructive" : "text-[11px] text-muted-foreground"}
        >
          {value.trim().length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  );
}
