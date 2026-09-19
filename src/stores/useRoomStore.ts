import { create } from "zustand";
import type { ConnectionState } from "@/types/chat";
import type { Room } from "@/types/room";

interface RoomState {
  /** Null when not inside a room. */
  room: Room | null;
  connection: ConnectionState;
  error: string | null;
  joinRoom: (roomId: string) => void;
  setConnection: (connection: ConnectionState) => void;
  setError: (error: string | null) => void;
  leaveRoom: () => void;
}

export const useRoomStore = create<RoomState>()((set) => ({
  room: null,
  connection: "idle",
  error: null,
  joinRoom: (roomId) =>
    set({ room: { id: roomId, createdAt: Date.now() }, error: null }),
  setConnection: (connection) => set({ connection }),
  setError: (error) => set({ error }),
  leaveRoom: () => set({ room: null, connection: "idle", error: null }),
}));

/** Selector: current room id, or null outside a room. */
export function useRoomId(): string | null {
  return useRoomStore((state) => state.room?.id ?? null);
}

/** Selector: connection status for headers and status indicators. */
export function useConnection(): ConnectionState {
  return useRoomStore((state) => state.connection);
}
