/** Room, participant, and temporary-user models. */

export interface Room {
  id: string;
  createdAt: number;
}

export interface Participant {
  id: string;
  displayName: string;
  joinedAt: number;
  isMuted: boolean;
  hasVideo: boolean;
}

/** Ephemeral client identity. Lives in memory (+ tab sessionStorage). */
export interface TempUser {
  id: string;
  displayName: string;
}
