import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

type Status = "Approved" | "Pending" | "Rejected";

export default function StatusBadge({ status }: { status: Status }) {
  const { colors } = useAppTheme();
  const map: Record<Status, { bg: string; fg: string }> = {
    Approved: { bg: colors.successTint, fg: colors.success },
    Pending: { bg: colors.warningTint, fg: colors.warning },
    Rejected: { bg: colors.dangerTint, fg: colors.danger },
  };
  const c = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
