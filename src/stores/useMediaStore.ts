import { create } from "zustand";
import type { CallState } from "@/types/media";

interface MediaState {
  /** Local mic toggle. Frontend-only until WebRTC lands. */
  microphoneEnabled: boolean;
  /** Local camera toggle. Frontend-only until WebRTC lands. */
  cameraEnabled: boolean;
  sharingScreen: boolean;
  callState: CallState;
  mediaError: string | null;
  toggleMicrophone: () => void;
  toggleCamera: () => void;
  setSharingScreen: (sharing: boolean) => void;
  setCallState: (callState: CallState) => void;
  setMediaError: (error: string | null) => void;
  reset: () => void;
}

const INITIAL: Pick<
  MediaState,
  "microphoneEnabled" | "cameraEnabled" | "sharingScreen" | "callState" | "mediaError"
> = {
  microphoneEnabled: true,
  cameraEnabled: false,
  sharingScreen: false,
  callState: "idle",
  mediaError: null,
};

export const useMediaStore = create<MediaState>()((set) => ({
  ...INITIAL,
  toggleMicrophone: () =>
    set((state) => ({ microphoneEnabled: !state.microphoneEnabled })),
  toggleCamera: () =>
    set((state) => ({ cameraEnabled: !state.cameraEnabled })),
  setSharingScreen: (sharingScreen) => set({ sharingScreen }),
  setCallState: (callState) => set({ callState }),
  setMediaError: (mediaError) => set({ mediaError }),
  reset: () => set({ ...INITIAL }),
}));
