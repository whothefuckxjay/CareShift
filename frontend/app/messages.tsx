import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageCircle } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessagesContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { EmptyView } from "@/components/StateViews";
import { MessageThread } from "@/api/types";

export default function MessagesScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { threads, refreshThreads } = useMessages();
  const { contentMaxWidth } = useResponsive();

  useFocusEffect(
    useCallback(() => {
      refreshThreads();
    }, [refreshThreads])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Messages" showBell={false} />
      {threads.length === 0 ? (
        <EmptyView message="No conversations yet. Messages from HR will show up here." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
            <Card style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
              {threads.map((thread, idx) => (
                <ThreadRow
                  key={thread.user.id}
                  thread={thread}
                  isLast={idx === threads.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: "/messages/[id]",
                      params: { id: thread.user.id, name: thread.user.name, avatar: thread.user.avatar ?? "" },
                    })
                  }
                  colors={colors}
                  isMine={thread.lastMessage.senderId === user?.id}
                />
              ))}
            </Card>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ThreadRow({
  thread,
  isLast,
  onPress,
  colors,
  isMine,
}: {
  thread: MessageThread;
  isLast: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  isMine: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
    >
      <Avatar uri={thread.user.avatar ?? undefined} name={thread.user.name} size={48} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.rowTop}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {thread.user.name}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatDistanceToNowStrict(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
          </Text>
        </View>
        <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
          {isMine ? "You: " : ""}
          {thread.lastMessage.body}
        </Text>
      </View>
      {thread.unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{thread.unreadCount}</Text>
        </View>
      ) : (
        <MessageCircle size={16} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", padding: 14 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "700", flexShrink: 1, marginRight: 8 },
  time: { fontSize: 11 },
  preview: { fontSize: 13, marginTop: 3 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, marginLeft: 8 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
