import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const userId = useAuthStore.getState().user?.id;
    socket = io(API_URL, {
      query: { userId },
      transports: ["websocket"],
      autoConnect: false,
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
  | { type: "lab-report:processing"; reportId: string; progress: number }
  | { type: "lab-report:completed"; reportId: string }
  | { type: "lab-report:failed"; reportId: string; error: string };
