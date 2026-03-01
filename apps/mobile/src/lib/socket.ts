import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth.store";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const userId = useAuthStore.getState().user?.id;
    socket = io(API_URL, {
      query: { userId },
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`[Socket] Reconnected after ${attempt} attempts`);
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}

export type LabReportEvent =
  | { type: "lab-report:processing"; reportId: string; progress: number; message?: string }
  | { type: "lab-report:completed"; reportId: string }
  | { type: "lab-report:failed"; reportId: string; error: string };
