import { useCallback } from "react";
import { useMediaStore } from "@/stores/useMediaStore";
import { useParticipantStore } from "@/stores/useParticipantStore";
import { getMediaSession } from "@/services/media/MediaSession";
import { MediaSessionError } from "@/types/media";

/**
 * Media controls, honest about the future.
 *
 * Mic/camera toggles update local state + presence so the UI is ready for
 * WebRTC. Starting audio/video/screen-share calls the media session, which
 * rejects until a real implementation (with signaling) exists — the error
 * is surfaced instead of faking a call.
 */
export function useMediaSession(roomId: string | null, selfId: string | null) {
  const microphoneEnabled = useMediaStore((s) => s.microphoneEnabled);
  const cameraEnabled = useMediaStore((s) => s.cameraEnabled);
  const mediaError = useMediaStore((s) => s.mediaError);
  const callState = useMediaStore((s) => s.callState);

  const syncPresence = useCallback(
    (media: { isMuted: boolean; hasVideo: boolean }) => {
      if (roomId && selfId) {
        useParticipantStore.getState().updateParticipantMedia(roomId, selfId, media);
      }
    },
    [roomId, selfId],
  );

  const toggleMicrophone = useCallback(() => {
    useMediaStore.getState().toggleMicrophone();
    const { microphoneEnabled, cameraEnabled } = useMediaStore.getState();
    syncPresence({
      isMuted: !microphoneEnabled,
      hasVideo: cameraEnabled,
    });
  }, [syncPresence]);

  const toggleCamera = useCallback(() => {
    useMediaStore.getState().toggleCamera();
    const { microphoneEnabled, cameraEnabled } = useMediaStore.getState();
    syncPresence({
      isMuted: !microphoneEnabled,
      hasVideo: cameraEnabled,
    });
  }, [syncPresence]);

  const explainUnavailable = useCallback((error: unknown): string => {
    const message =
      error instanceof MediaSessionError
        ? error.message
        : "Calling is not available yet.";
    useMediaStore.getState().setMediaError(message);
    useMediaStore.getState().setCallState("error");
    return message;
  }, []);

  const startAudio = useCallback(async (): Promise<string | null> => {
    try {
      useMediaStore.getState().setCallState("starting");
      await getMediaSession().startAudio();
      useMediaStore.getState().setCallState("in-call");
      return null;
    } catch (error) {
      return explainUnavailable(error);
    }
  }, [explainUnavailable]);

  const startVideo = useCallback(async (): Promise<string | null> => {
    try {
      useMediaStore.getState().setCallState("starting");
      await getMediaSession().startVideo();
      useMediaStore.getState().setCallState("in-call");
      return null;
    } catch (error) {
      return explainUnavailable(error);
    }
  }, [explainUnavailable]);

  const dismissMediaError = useCallback(() => {
    useMediaStore.getState().setMediaError(null);
    useMediaStore.getState().setCallState("idle");
  }, []);

  return {
    microphoneEnabled,
    cameraEnabled,
    mediaError,
    callState,
    toggleMicrophone,
    toggleCamera,
    startAudio,
    startVideo,
    dismissMediaError,
  };
}
