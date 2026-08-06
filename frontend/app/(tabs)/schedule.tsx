import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import { MapPin, ChevronRight, Bell } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as shiftsApi from "@/api/shifts";
import type { ApiShift } from "@/api/types";

function shiftLabel(s: ApiShift) {
  return s.type === "MORNING" ? "Morning Shift" : s.type === "EVENING" ? "Evening Shift" : "Night Shift";
}
function shiftColor(s: ApiShift, colors: any) {
  return s.type === "MORNING" ? colors.success : s.type === "EVENING" ? colors.info : colors.primary;
}

export default function ScheduleTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const todayIso = new Date().toISOString().split("T")[0];
  const [selected, setSelected] = useState(todayIso);

  const { state, refresh } = useApi<ApiShift[]>(() => shiftsApi.getMyShifts());

  const shiftsByDate = useMemo(() => {
    if (state.status !== "ok") return {} as Record<string, ApiShift[]>;
    const map: Record<string, ApiShift[]> = {};
    state.data.forEach((s) => {
      const d = s.date.split("T")[0];
      map[d] = map[d] ? [...map[d], s] : [s];
    });
    return map;
  }, [state]);

  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};
    Object.keys(shiftsByDate).forEach((d) => {
      const s = shiftsByDate[d][0];
      marked[d] = { marked: true, dotColor: shiftColor(s, colors) };
    });
    marked[selected] = { ...(marked[selected] ?? {}), selected: true, selectedColor: colors.primary };
    return marked;
  }, [shiftsByDate, selected, colors]);

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

  const dayShifts = shiftsByDate[selected] ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Schedule</Text>
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
          <Card style={{ marginTop: 14, padding: 8 }}>
            <Calendar
              current={selected}
              onDayPress={(d: DateData) => setSelected(d.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.surface, calendarBackground: colors.surface,
                textSectionTitleColor: colors.textMuted,
                selectedDayBackgroundColor: colors.primary, selectedDayTextColor: "#fff",
                todayTextColor: colors.primary, dayTextColor: colors.text,
                textDisabledColor: colors.textMuted, monthTextColor: colors.text,
                arrowColor: colors.primary,
              }}
              style={{ borderRadius: 14 }}
            />
          </Card>

          <Text style={[styles.dayHeading, { color: colors.text }]}>
            {new Date(selected + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </Text>

          {dayShifts.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 28 }}>
              <Text style={{ color: colors.textSecondary }}>No shift assigned for this day.</Text>
            </Card>
          ) : dayShifts.map((shift) => (
            <Pressable key={shift.id} onPress={() => router.push(`/schedule/${shift.id}`)}>
              <Card style={styles.shiftCard}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.shiftTitle, { color: colors.text }]}>{shiftLabel(shift)}</Text>
                    {shift.date.split("T")[0] === todayIso && (
                      <View style={[styles.upcomingPill, { backgroundColor: colors.primaryTint }]}>
                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>Upcoming</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.rowGap}>
                    <View style={[styles.smallDot, { backgroundColor: shiftColor(shift, colors) }]} />
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {shift.startTime} – {shift.endTime}
                    </Text>
                  </View>
                  <View style={styles.rowGap}>
                    <MapPin size={13} color={colors.textMuted} />
                    <Text style={[styles.wardText, { color: colors.textMuted }]}>{shift.ward}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Card>
            </Pressable>
          ))}

          <Text style={[styles.dayHeading, { color: colors.text }]}>Full Week</Text>
          {state.data.map((shift) => {
            const d = new Date(shift.date);
            return (
              <Pressable key={shift.id} onPress={() => router.push(`/schedule/${shift.id}`)}>
                <Card style={styles.weekRow}>
                  <View style={{ width: 52 }}>
                    <Text style={[styles.weekDay, { color: colors.text }]}>
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </Text>
                    <Text style={[styles.weekDate, { color: colors.textMuted }]}>
                      {d.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timeText, { color: colors.text, fontWeight: "700" }]}>
                      {shift.startTime} – {shift.endTime}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{shiftLabel(shift)}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  page: { paddingHorizontal: 16 },
  dayHeading: { fontSize: 15, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  shiftCard: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  upcomingPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  shiftTitle: { fontSize: 15, fontWeight: "700" },
  rowGap: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  smallDot: { width: 7, height: 7, borderRadius: 4 },
  timeText: { fontSize: 13 },
  wardText: { fontSize: 12 },
  weekRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  weekDay: { fontSize: 13, fontWeight: "700" },
  weekDate: { fontSize: 11 },
});
