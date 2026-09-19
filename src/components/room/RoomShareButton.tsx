import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";

/** Copies the invite link and reports success/failure via toast. */
export function RoomShareButton({ onShare }: { onShare: () => Promise<boolean> }) {
  const handleShare = async () => {
    const ok = await onShare();
    if (ok) {
      toast.success("Invite link copied", {
        description: "Share it with anyone you want in the room.",
      });
    } else {
      toast.error("Could not copy the link", {
        description: "Copy the URL from your address bar instead.",
      });
    }
  };

  return (
    <Hint label="Copy invite link">
      <Button variant="outline" size="sm" onClick={() => void handleShare()}>
        <Link2 aria-hidden="true" />
        Share
      </Button>
    </Hint>
  );
}
