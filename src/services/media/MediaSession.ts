import type { MediaSession } from "@/types/media";
import { createUnavailableMediaSession } from "@/types/media";

let session: MediaSession | null = null;

/**
 * Single access point for the media layer.
 *
 * Today this returns an unavailable-session placeholder so the UI can render
 * honest "calling is not available yet" states. A real WebRTC implementation
 * (getUserMedia + RTCPeerConnection + signaling) plugs in here without
 * touching components or stores.
 */
export function getMediaSession(): MediaSession {
  if (!session) {
    session = createUnavailableMediaSession();
  }
  return session;
}
