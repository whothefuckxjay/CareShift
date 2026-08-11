import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, TOKEN_KEY } from "@/api/client";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let socket: Socket | undefined;

export async function connectSocket(): Promise<Socket | undefined> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return undefined;
  if (socket?.connected) return socket;

  socket?.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = undefined;
}

export function getSocket(): Socket | undefined {
  return socket;
}
