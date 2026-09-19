import { Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Hint } from "@/components/ui/tooltip";
import { useMediaSession } from "@/hooks/useMediaSession";

interface CallControlsProps {
  roomId: string;
  selfId: string | null;
}

/**
 * Call bar. Mic/camera toggle local presence state (ready for WebRTC);
 * starting a call is disabled until signaling exists — the tooltip and the
 * error message say so instead of faking it.
 */
export function CallControls({ roomId, selfId }: CallControlsProps) {
  const {
    microphoneEnabled,
    cameraEnabled,
    mediaError,
    toggleMicrophone,
    toggleCamera,
    startAudio,
    startVideo,
    dismissMediaError,
  } = useMediaSession(roomId, selfId);

  const handleStartAudio = async () => {
    const failure = await startAudio();
    if (failure) toast.error("Voice calls are not available yet", { description: failure });
  };

  const handleStartVideo = async () => {
    const failure = await startVideo();
    if (failure) toast.error("Video calls are not available yet", { description: failure });
  };

  return (
    <div className="space-y-2">
      {mediaError && (
        <Alert variant="destructive" className="flex items-start justify-between gap-2">
          <span>{mediaError}</span>
          <Button variant="ghost" size="sm" onClick={dismissMediaError}>
            Dismiss
          </Button>
        </Alert>
      )}
      <div
        role="toolbar"
        aria-label="Call controls"
        className="flex items-center gap-1.5"
      >
        <Hint label={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}>
          <Button
            variant="outline"
            size="icon"
            aria-pressed={microphoneEnabled}
            aria-label={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
            onClick={toggleMicrophone}
          >
            {microphoneEnabled ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
          </Button>
        </Hint>
        <Hint label={cameraEnabled ? "Turn camera off" : "Turn camera on"}>
          <Button
            variant="outline"
            size="icon"
            aria-pressed={cameraEnabled}
            aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
            onClick={toggleCamera}
          >
            {cameraEnabled ? <Video aria-hidden="true" /> : <VideoOff aria-hidden="true" />}
          </Button>
        </Hint>
        <Hint label="Voice calls need a signaling server (coming soon)">
          <span className="inline-flex">
            <Button
              variant="outline"
              size="icon"
              disabled
              aria-label="Start voice call (not available yet)"
              onClick={() => void handleStartAudio()}
            >
              <Phone aria-hidden="true" />
            </Button>
          </span>
        </Hint>
        <Hint label="Video calls need a signaling server (coming soon)">
          <span className="inline-flex">
            <Button
              variant="outline"
              size="icon"
              disabled
              aria-label="Start video call (not available yet)"
              onClick={() => void handleStartVideo()}
            >
              <Video aria-hidden="true" />
            </Button>
          </span>
        </Hint>
      </div>
    </div>
  );
}
