import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Send } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessagesContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Avatar from "@/components/Avatar";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as messagesApi from "@/api/messages";
import { apiErrorMessage } from "@/api/client";
import { getSocket } from "@/lib/socket";
import type { ApiMessage } from "@/api/types";

export default function MessageThreadScreen() {
  const { colors } = useAppTheme();
  const { id, name, avatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
  const { user } = useAuth();
  const { setActiveThread, refreshThreads } = useMessages();
  const { contentMaxWidth } = useResponsive();
  const listRef = useRef<FlatList<ApiMessage>>(null);

  const [messages, setMessages] = useState<ApiMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await messagesApi.getThread(id);
      setMessages(data);
      await messagesApi.markThreadRead(id);
      refreshThreads();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setActiveThread(id ?? null);
      load();
      return () => setActiveThread(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id) return;

    const onNew = (message: ApiMessage) => {
      if (message.senderId !== id) return;
      setMessages((prev) => (prev ? [...prev, message] : [message]));
      messagesApi.markThreadRead(id).then(refreshThreads).catch(() => {});
    };
    const onDeleted = ({ id: deletedId }: { id: string }) => {
      setMessages((prev) => (prev ? prev.filter((m) => m.id !== deletedId) : prev));
    };

    socket.on("message:new", onNew);
    socket.on("message:deleted", onDeleted);
    return () => {
      socket.off("message:new", onNew);
      socket.off("message:deleted", onDeleted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSend = async () => {
    const body = draft.trim();
    if (!body || !id || sending) return;
    setSending(true);
    setDraft("");
    try {
      const message = await messagesApi.sendMessage(id, body);
      setMessages((prev) => (prev ? [...prev, message] : [message]));
      refreshThreads();
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setDraft(body);
      Alert.alert("Couldn't send message", apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const onDelete = (message: ApiMessage) => {
    Alert.alert("Delete message", "This removes the message for both you and the other person.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await messagesApi.deleteMessage(message.id);
            setMessages((prev) => (prev ? prev.filter((m) => m.id !== message.id) : prev));
          } catch (err) {
            Alert.alert("Couldn't delete message", apiErrorMessage(err));
          }
        },
      },
    ]);
  };

  const title = name || messages?.find((m) => m.senderId === id)?.sender?.name || "Conversation";

  if (messages === null && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title={title} showBell={false} />
        <LoadingView />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title={title} showBell={false} />
        <ErrorView message={error} onRetry={load} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenHeader title={title} showBell={false} />
      <FlatList
        ref={listRef}
        data={messages ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.list, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id;
          return (
            <Pressable
              onLongPress={() => onDelete(item)}
              style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}
            >
              {!isMine ? <Avatar uri={item.sender?.avatar ?? undefined} name={item.sender?.name ?? "?"} size={28} /> : null}
              <View
                style={[
                  styles.bubble,
                  isMine
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text style={{ color: isMine ? "#fff" : colors.text, fontSize: 14 }}>{item.body}</Text>
                <Text style={[styles.time, { color: isMine ? "rgba(255,255,255,0.75)" : colors.textMuted }]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {isMine ? (item.read ? " · Read" : "") : ""}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No messages yet. Say hello.
          </Text>
        }
      />
      <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          multiline
        />
        <Pressable
          onPress={onSend}
          disabled={sending || !draft.trim()}
          style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: sending || !draft.trim() ? 0.5 : 1 }]}
        >
          {sending ? <ActivityIndicator color="#fff" size="small" /> : <Send size={18} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingVertical: 16, gap: 10, flexGrow: 1 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "82%" },
  bubbleRowMine: { alignSelf: "flex-end" },
  bubbleRowTheirs: { alignSelf: "flex-start" },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  time: { fontSize: 10, marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
