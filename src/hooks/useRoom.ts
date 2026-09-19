import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/stores/useChatStore";
import { useIdentity } from "@/stores/useIdentityStore";
import { useParticipantStore } from "@/stores/useParticipantStore";
import { useMediaStore } from "@/stores/useMediaStore";
import { useConnection, useRoomStore } from "@/stores/useRoomStore";
import { getChatTransport } from "@/services/chat/transport";
import { isValidRoomId } from "@/lib/room";

/**
 * Owns the room lifecycle: transport subscription, connect/disconnect,
 * online/offline awareness, leave + share. Mount once per RoomPage.
 */
export function useRoom(roomId: string | null) {
  const navigate = useNavigate();
  const user = useIdentity();
  const room = useRoomStore((state) => state.room);
  const connection = useConnection();
  const roomError = useRoomStore((state) => state.error);

  const codeValid = roomId === null || isValidRoomId(roomId);

  useEffect(() => {
    if (!roomId || !user || !isValidRoomId(roomId)) return;

    const transport = getChatTransport();
    const offMessage = transport.onMessage((message) => {
      if (message.roomId === roomId) {
        useChatStore.getState().addMessage(message);
      }
    });
    const offPresence = transport.onPresence((event) => {
      const store = useParticipantStore.getState();
      if (event.type === "leave") {
        store.removeParticipant(roomId, event.participant.id);
      } else {
        store.upsertParticipant(roomId, event.participant);
      }
    });
    const offStatus = transport.onStatus((status) => {
      const store = useRoomStore.getState();
      store.setConnection(status);
      if (status === "connected") {
        store.setError(null);
      }
    });

    useRoomStore.getState().joinRoom(roomId);
    transport
      .connect(roomId, user)
      .then(() => {
        useRoomStore.getState().setError(null);
      })
      .catch(() => {
        useRoomStore.getState().setError("Could not connect. Check your connection and try again.");
        useRoomStore.getState().setConnection("error");
      });

    const handleOffline = () => useRoomStore.getState().setConnection("reconnecting");
    const handleOnline = () => {
      transport
        .connect(roomId, user)
        .then(() => {
          useRoomStore.getState().setError(null);
        })
        .catch(() => {
          useRoomStore.getState().setError("Could not connect. Check your connection and try again.");
          useRoomStore.getState().setConnection("error");
        });
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      offMessage();
      offPresence();
      offStatus();
      transport.disconnect();
    };
  }, [roomId, user]);

  const leave = useCallback(() => {
    if (roomId) {
      getChatTransport().disconnect();
      useChatStore.getState().clearRoomMessages(roomId);
      useParticipantStore.getState().clearRoomParticipants(roomId);
      useMediaStore.getState().reset();
      useRoomStore.getState().leaveRoom();
    }
    void navigate("/");
  }, [navigate, roomId]);

  const shareRoom = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Clipboard API unavailable (permissions, insecure context): fall back.
      try {
        const area = document.createElement("textarea");
        area.value = url;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    }
  }, [roomId]);

  return { room, connection, roomError, codeValid, leave, shareRoom };
}
