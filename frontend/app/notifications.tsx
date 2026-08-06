import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BellOff } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import ScreenHeader from "@/components/ScreenHeader";

export default function NotificationsScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Notifications" showBell={false} />
      <View style={styles.empty}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryTint }]}>
          <BellOff size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>You're all caught up</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          You have no notifications right now. New shift updates, leave approvals and reminders will show up here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  title: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  sub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
