import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useMessages } from "@/context/MessagesContext";

const DISMISS_AFTER_MS = 4000;

export default function Toast() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, dismissToast } = useMessages();
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (!toast) return;
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const timer = setTimeout(dismissToast, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast, translateY]);

  if (!toast) return null;

  const onPress = () => {
    dismissToast();
    router.push({ pathname: "/messages/[id]", params: { id: toast.otherUserId, name: toast.fromName } });
  };

  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: insets.top + 8, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
      >
        <MessageCircle size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {toast.fromName}
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={1}>
          {toast.body}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontWeight: "700", fontSize: 13, maxWidth: 110 },
  body: { flex: 1, fontSize: 13 },
});
