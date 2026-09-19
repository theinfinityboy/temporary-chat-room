/**
 * Media abstractions for FUTURE voice/video calling (WebRTC).
 *
 * Nothing here touches getUserMedia or RTCPeerConnection yet. The UI reads
 * local toggle state from the media store; real media needs a signaling
 * server, STUN/TURN, and (for groups) an SFU. See developer-guide.md.
 */

export type CallState = "idle" | "starting" | "in-call" | "error";

export type MediaErrorKind =
  | "permission-denied"
  | "unsupported"
  | "unavailable";

export class MediaSessionError extends Error {
  readonly kind: MediaErrorKind;

  constructor(kind: MediaErrorKind, message: string) {
    super(message);
    this.name = "MediaSessionError";
    this.kind = kind;
  }
}

export interface MediaSession {
  readonly isSupported: boolean;
  startAudio(): Promise<void>;
  startVideo(): Promise<void>;
  stop(): void;
  toggleMicrophone(): void;
  toggleCamera(): void;
  shareScreen(): Promise<void>;
}

/** True when the browser exposes the media-device APIs at all. */
export function isMediaApiSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

/**
 * Placeholder session used until a real WebRTC implementation (with
 * signaling) exists. Async methods reject with an honest error so the UI
 * can explain why calling is unavailable instead of pretending to work.
 */
export function createUnavailableMediaSession(
  reason = "Voice/video needs a signaling server, which is not implemented yet.",
): MediaSession {
  const fail = (): Promise<void> =>
    Promise.reject(new MediaSessionError("unavailable", reason));
  return {
    isSupported: isMediaApiSupported(),
    startAudio: fail,
    startVideo: fail,
    stop: () => undefined,
    toggleMicrophone: () => undefined,
    toggleCamera: () => undefined,
    shareScreen: fail,
  };
}
