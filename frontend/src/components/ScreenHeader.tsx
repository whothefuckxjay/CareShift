import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenHeader({
  title,
  showBack = true,
  showBell = true,
  onBellPress,
}: {
  title: string;
  showBack?: boolean;
  showBell?: boolean;
  onBellPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 10 },
      ]}
    >
      {showBack ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard"))}
          style={[styles.iconBtn, { backgroundColor: colors.background }]}
          hitSlop={10}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {showBell ? (
        <Pressable
          onPress={onBellPress ?? (() => router.push("/notifications"))}
          style={[styles.iconBtn, { backgroundColor: colors.background }]}
          hitSlop={10}
        >
          <Bell size={20} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});
