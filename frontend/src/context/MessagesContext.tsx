import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import * as messagesApi from "@/api/messages";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { ApiMessage, MessageThread } from "@/api/types";

type ToastData = { id: string; fromName: string; body: string; otherUserId: string };

type MessagesContextValue = {
  threads: MessageThread[];
  unreadCount: number;
  refreshThreads: () => Promise<void>;
  toast: ToastData | null;
  dismissToast: () => void;
  setActiveThread: (otherUserId: string | null) => void;
};

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const activeThreadRef = useRef<string | null>(null);

  const refreshThreads = useCallback(async () => {
    if (!user) return;
    try {
      setThreads(await messagesApi.listThreads());
    } catch {
      // ignore — inbox just shows stale data until the next successful refresh
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      setThreads([]);
      return;
    }
    refreshThreads();
    let cancelled = false;
    connectSocket().then((socket) => {
      if (!socket || cancelled) return;
      socket.on("message:new", (message: ApiMessage) => {
        refreshThreads();
        if (message.senderId !== activeThreadRef.current) {
          setToast({
            id: message.id,
            fromName: message.sender?.name ?? "New message",
            body: message.body,
            otherUserId: message.senderId,
          });
        }
      });
      socket.on("message:read", () => refreshThreads());
      socket.on("message:deleted", () => refreshThreads());
    });
    return () => {
      cancelled = true;
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const dismissToast = useCallback(() => setToast(null), []);
  const setActiveThread = useCallback((otherUserId: string | null) => {
    activeThreadRef.current = otherUserId;
  }, []);

  const unreadCount = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <MessagesContext.Provider
      value={{ threads, unreadCount, refreshThreads, toast, dismissToast, setActiveThread }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
