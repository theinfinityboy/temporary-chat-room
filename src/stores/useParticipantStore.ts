import { create } from "zustand";
import type { Participant } from "@/types/room";

/** Shared empty reference so selectors never return a fresh array. */
export const EMPTY_PARTICIPANTS: Participant[] = [];

interface ParticipantState {
  participantsByRoom: Record<string, Participant[]>;
  upsertParticipant: (roomId: string, participant: Participant) => void;
  removeParticipant: (roomId: string, participantId: string) => void;
  updateParticipantMedia: (
    roomId: string,
    participantId: string,
    media: Pick<Participant, "isMuted" | "hasVideo">,
  ) => void;
  clearRoomParticipants: (roomId: string) => void;
}

export const useParticipantStore = create<ParticipantState>()((set) => ({
  participantsByRoom: {},
  upsertParticipant: (roomId, participant) =>
    set((state) => {
      const existing = state.participantsByRoom[roomId] ?? EMPTY_PARTICIPANTS;
      const index = existing.findIndex((p) => p.id === participant.id);
      const next =
        index === -1
          ? [...existing, participant]
          : existing.map((p, i) => (i === index ? { ...p, ...participant } : p));
      return { participantsByRoom: { ...state.participantsByRoom, [roomId]: next } };
    }),
  removeParticipant: (roomId, participantId) =>
    set((state) => {
      const existing = state.participantsByRoom[roomId];
      if (!existing) return state;
      return {
        participantsByRoom: {
          ...state.participantsByRoom,
          [roomId]: existing.filter((p) => p.id !== participantId),
        },
      };
    }),
  updateParticipantMedia: (roomId, participantId, media) =>
    set((state) => {
      const existing = state.participantsByRoom[roomId];
      if (!existing) return state;
      return {
        participantsByRoom: {
          ...state.participantsByRoom,
          [roomId]: existing.map((p) =>
            p.id === participantId ? { ...p, ...media } : p,
          ),
        },
      };
    }),
  clearRoomParticipants: (roomId) =>
    set((state) => {
      if (!(roomId in state.participantsByRoom)) return state;
      const next = { ...state.participantsByRoom };
      delete next[roomId];
      return { participantsByRoom: next };
    }),
}));

/** Selector: participants for one room (stable empty reference when none). */
export function useParticipants(roomId: string | null): Participant[] {
  return useParticipantStore((state) =>
    roomId ? (state.participantsByRoom[roomId] ?? EMPTY_PARTICIPANTS) : EMPTY_PARTICIPANTS,
  );
}

/** Selector: derived count — components subscribe to the number, not the array. */
export function useParticipantCount(roomId: string | null): number {
  return useParticipantStore((state) =>
    roomId ? (state.participantsByRoom[roomId]?.length ?? 0) : 0,
  );
}
