import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Sparkles } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as shiftsApi from "@/api/shifts";
import type { DayCoverage } from "@/api/types";

const SHIFT_ROWS: { key: keyof DayCoverage; label: string; time: string }[] = [
  { key: "morning", label: "Morning Shift", time: "7:00 AM – 3:00 PM" },
  { key: "evening", label: "Evening Shift", time: "3:00 PM – 11:00 PM" },
  { key: "night", label: "Night Shift", time: "11:00 PM – 7:00 AM" },
];

function coverageColor(filled: number, required: number, colors: any) {
  const pct = required > 0 ? filled / required : 0;
  return pct >= 1 ? colors.success : pct >= 0.85 ? colors.warning : colors.danger;
}

export default function HRScheduleTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();

  const { state, refresh } = useApi<DayCoverage[]>(() => shiftsApi.getWeekCoverage());

  if (state.status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingView />
      </View>
    );
  }
  if (state.status === "error") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorView message={state.message} onRetry={refresh} />
      </View>
    );
  }

  const coverage = state.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Schedule</Text>
        <Pressable onPress={() => router.push("/notifications")} hitSlop={8}>
          <Bell size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={styles.legendRow}>
            {[{ color: colors.success, label: "Fully Covered" }, { color: colors.warning, label: "Partial" }, { color: colors.danger, label: "Understaffed" }].map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{l.label}</Text>
              </View>
            ))}
          </View>

          {SHIFT_ROWS.map((row) => (
            <Card key={String(row.key)} style={{ marginBottom: 14 }}>
              <Text style={[styles.shiftTitle, { color: colors.text }]}>{row.label}</Text>
              <Text style={[styles.shiftTime, { color: colors.textMuted }]}>{row.time}</Text>
              <View style={styles.dayGrid}>
                {coverage.map((day) => {
                  const info = day[row.key] as { filled: number; required: number };
                  const color = coverageColor(info.filled, info.required, colors);
                  return (
                    <View key={day.date} style={styles.dayCell}>
                      <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{day.day}</Text>
                      <View style={[styles.dayBadge, { backgroundColor: color + "22" }]}>
                        <Text style={[styles.dayBadgeText, { color }]}>
                          {info.filled}/{info.required}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          ))}

          <Pressable
            onPress={() => router.push("/hr/generate-schedule")}
            style={[styles.generateBtn, { backgroundColor: colors.primary }]}
          >
            <Sparkles size={18} color="#fff" />
            <Text style={styles.generateBtnText}>Auto-Generate Schedule</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  page: { paddingHorizontal: 16, paddingTop: 14 },
  legendRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  shiftTitle: { fontSize: 14, fontWeight: "700" },
  shiftTime: { fontSize: 11, marginTop: 2, marginBottom: 12 },
  dayGrid: { flexDirection: "row", justifyContent: "space-between" },
  dayCell: { alignItems: "center", gap: 6 },
  dayLabel: { fontSize: 10, fontWeight: "700" },
  dayBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  dayBadgeText: { fontSize: 10, fontWeight: "800" },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14, marginTop: 6 },
  generateBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
