import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Bell } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as availabilityApi from "@/api/availability";
import type { WeeklyAvailability } from "@/api/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const SHIFTS: { key: "morning" | "evening" | "night"; label: string; sub: string }[] = [
  { key: "morning", label: "Morning", sub: "7AM-3PM" },
  { key: "evening", label: "Evening", sub: "3PM-11PM" },
  { key: "night", label: "Night", sub: "11PM-7AM" },
];

export default function AvailabilityTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [localData, setLocalData] = useState<WeeklyAvailability | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const { state, refresh } = useApi<WeeklyAvailability>(() => availabilityApi.getMyAvailability());

  useEffect(() => {
    if (state.status === "ok") setLocalData(state.data);
  }, [state.status]);

  const toggle = (day: typeof DAYS[number], shift: "morning" | "evening" | "night") => {
    Haptics.selectionAsync().catch(() => {});
    setLocalData((prev) =>
      prev ? { ...prev, [day]: { ...prev[day], [shift]: !prev[day][shift] } } : prev
    );
  };

  const onSave = async () => {
    if (!localData) return;
    setSaving(true);
    try {
      await availabilityApi.saveMyAvailability(localData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (state.status === "loading" && !localData) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingView />
      </View>
    );
  }
  if (state.status === "error" && !localData) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorView message={state.message} onRetry={refresh} />
      </View>
    );
  }

  const data = localData ?? {
  Mon: { morning: false, evening: false, night: false },
  Tue: { morning: false, evening: false, night: false },
  Wed: { morning: false, evening: false, night: false },
  Thu: { morning: false, evening: false, night: false },
  Fri: { morning: false, evening: false, night: false },
  Sat: { morning: false, evening: false, night: false },
  Sun: { morning: false, evening: false, night: false },
};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Availability</Text>
        <Pressable onPress={() => router.push("/notifications")} hitSlop={8}>
          <Bell size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={state.status === "loading"} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Text style={[styles.title, { color: colors.text }]}>Set your weekly availability</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select the days and shifts you are available to work.
          </Text>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <View style={[styles.gridHeaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dayHeaderCell, { color: colors.textMuted }]}>Day</Text>
              {SHIFTS.map((s) => (
                <View key={s.key} style={styles.shiftHeaderCell}>
                  <Text style={[styles.shiftHeaderLabel, { color: colors.textMuted }]}>{s.label}</Text>
                  <Text style={[styles.shiftHeaderSub, { color: colors.textMuted }]}>{s.sub}</Text>
                </View>
              ))}
            </View>
            {DAYS.map((day, idx) => (
              <View
                key={day}
                style={[
                  styles.gridRow,
                  idx !== DAYS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.dayCell, { color: colors.text }]}>{day}</Text>
                {SHIFTS.map((s) => {
                  const checked = data[day][s.key];
                  return (
                    <View key={s.key} style={styles.shiftCell}>
                      <Pressable
                        onPress={() => toggle(day, s.key)}
                        style={[styles.checkbox, { backgroundColor: checked ? colors.primary : colors.surface, borderColor: checked ? colors.primary : colors.border }]}
                        hitSlop={8}
                      >
                        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </Card>

          <Pressable
            onPress={onSave}
            disabled={saving}
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          >
            <Text style={styles.saveButtonText}>
              {savedMsg ? "Saved ✓" : saving ? "Saving…" : "Save Availability"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/availability/preferences")}
            style={[styles.prefsBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.prefsBtnText, { color: colors.primary }]}>My Preferences</Text>
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
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },
  gridHeaderRow: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  dayHeaderCell: { width: 56, fontSize: 11, fontWeight: "700" },
  shiftHeaderCell: { flex: 1, alignItems: "center" },
  shiftHeaderLabel: { fontSize: 11, fontWeight: "700" },
  shiftHeaderSub: { fontSize: 9, marginTop: 1 },
  gridRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12 },
  dayCell: { width: 56, fontSize: 13, fontWeight: "600" },
  shiftCell: { flex: 1, alignItems: "center" },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  saveButton: { marginTop: 20, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  prefsBtn: { marginTop: 12, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  prefsBtnText: { fontWeight: "700", fontSize: 14 },
});
