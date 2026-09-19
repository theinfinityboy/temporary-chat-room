import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? 8080);
const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;
const MAX_MESSAGE_LENGTH = 1000;
const DISPLAY_NAME_MAX_LENGTH = 24;
const MAX_HISTORY = 200;

function normalizeRoomId(input) {
  return String(input ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 6);
}

function normalizeDisplayName(input) {
  return String(input ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, DISPLAY_NAME_MAX_LENGTH);
}

/** roomId -> { participants: Map<ws, participant>, messages: ChatMessage[] } */
const rooms = new Map();

function getRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = { participants: new Map(), messages: [] };
    rooms.set(roomId, room);
  }
  return room;
}

function send(ws, frame) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(frame));
  }
}

function broadcast(roomId, frame, except = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const client of room.participants.keys()) {
    if (client !== except && client.readyState === client.OPEN) {
      client.send(JSON.stringify(frame));
    }
  }
}

function leaveRoom(ws) {
  const roomId = ws.data?.roomId;
  const user = ws.data?.user;
  if (!roomId || !user) return;
  const room = rooms.get(roomId);
  if (!room) return;
  if (!room.participants.has(ws)) return;
  room.participants.delete(ws);
  ws.data = null;
  broadcast(roomId, {
    type: "presence",
    event: {
      type: "leave",
      participant: {
        id: user.id,
        displayName: user.displayName,
        joinedAt: user.joinedAt,
        isMuted: false,
        hasVideo: false,
      },
    },
  });
  if (room.participants.size === 0) {
    rooms.delete(roomId);
  }
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  ws.data = null;

  ws.on("message", (raw) => {
    let frame;
    try {
      frame = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (!frame || typeof frame !== "object" || typeof frame.type !== "string") return;

    if (frame.type === "join") {
      const roomId = normalizeRoomId(frame.roomId);
      const userId = String(frame.user?.id ?? "").slice(0, 128);
      const displayName = normalizeDisplayName(frame.user?.displayName);
      if (!ROOM_CODE_PATTERN.test(roomId)) return;
      if (!userId || displayName.length === 0) return;

      // Switching rooms: leave the old one first.
      if (ws.data?.roomId && ws.data.roomId !== roomId) {
        leaveRoom(ws);
      }

      const room = getRoom(roomId);
      const participant = {
        id: userId,
        displayName,
        joinedAt: Date.now(),
        isMuted: false,
        hasVideo: false,
      };
      ws.data = { roomId, user: participant };

      // Catch-up for the newcomer: existing roster + recent history.
      for (const existing of room.participants.values()) {
        send(ws, { type: "presence", event: { type: "join", participant: existing } });
      }
      for (const message of room.messages) {
        send(ws, { type: "message", message });
      }

      room.participants.set(ws, participant);
      broadcast(roomId, { type: "presence", event: { type: "join", participant } });
      return;
    }

    if (frame.type === "message") {
      const roomId = normalizeRoomId(frame.roomId);
      const session = ws.data;
      if (!session || session.roomId !== roomId) return;
      const content = String(frame.content ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
      if (content.length === 0) return;
      const room = rooms.get(roomId);
      if (!room || !room.participants.has(ws)) return;
      const message = {
        id: `ws-${randomUUID()}`,
        roomId,
        senderId: session.user.id,
        senderName: session.user.displayName,
        content,
        createdAt: Date.now(),
      };
      room.messages.push(message);
      if (room.messages.length > MAX_HISTORY) {
        room.messages.splice(0, room.messages.length - MAX_HISTORY);
      }
      broadcast(roomId, { type: "message", message });
      return;
    }

    if (frame.type === "leave") {
      leaveRoom(ws);
    }
  });

  ws.on("close", () => {
    leaveRoom(ws);
  });

  ws.on("error", () => {
    // Socket errors surface on the client via close/error events; nothing to do here.
  });
});

wss.on("listening", () => {
  console.log(`temp-chat-room server listening on ws://localhost:${PORT}`);
});
