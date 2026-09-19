import { create } from "zustand";
import { createTempUserId, normalizeDisplayName } from "@/lib/user";
import type { TempUser } from "@/types/room";

const STORAGE_KEY = "temp-chat-identity-v1";

interface IdentityState {
  /** Null until the user picks a temporary display name. */
  user: TempUser | null;
  setDisplayName: (displayName: string) => void;
  clear: () => void;
}

function loadStoredUser(): TempUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TempUser>;
    if (typeof parsed.id !== "string" || typeof parsed.displayName !== "string") {
      return null;
    }
    return { id: parsed.id, displayName: parsed.displayName };
  } catch {
    return null;
  }
}

function storeUser(user: TempUser | null): void {
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Private browsing / disabled storage: identity just stays in memory.
  }
}

/**
 * Ephemeral identity: a random per-tab id plus a display name.
 * Tab-scoped (sessionStorage) so nothing survives the session.
 */
export const useIdentityStore = create<IdentityState>()((set) => ({
  user: loadStoredUser(),
  setDisplayName: (displayName) =>
    set((state) => {
      const user: TempUser = {
        id: state.user?.id ?? createTempUserId(),
        displayName: normalizeDisplayName(displayName),
      };
      storeUser(user);
      return { user };
    }),
  clear: () => {
    storeUser(null);
    set({ user: null });
  },
}));

/** Selector: the current temporary user (or null). */
export function useIdentity(): TempUser | null {
  return useIdentityStore((state) => state.user);
}
