import { useParticipantCount, useParticipants } from "@/stores/useParticipantStore";

/**
 * Read-only view over room presence. Components subscribe to the list and
 * the derived count separately so the header badge never re-renders the list.
 */
export function useParticipantsView(roomId: string | null) {
  const participants = useParticipants(roomId);
  const count = useParticipantCount(roomId);
  return { participants, count };
}
