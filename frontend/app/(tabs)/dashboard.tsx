import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CalendarDays, CalendarCheck, CalendarClock, Bell,
  ChevronRight, FileClock, CalendarCog, Repeat,
} from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import ProgressRing from "@/components/ProgressRing";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as shiftsApi from "@/api/shifts";
import * as leaveApi from "@/api/leave";
import type { ApiShift, ApiLeaveRequest } from "@/api/types";

type DashData = { shifts: ApiShift[]; leaveRequests: ApiLeaveRequest[] };

const TOTAL_LEAVE_DAYS = 20;

function shiftLabel(s: ApiShift) {
  return s.type === "MORNING" ? "Morning Shift" : s.type === "EVENING" ? "Evening Shift" : "Night Shift";
}

export default function Dashboard() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, contentMaxWidth } = useResponsive();
  const today = new Date().toISOString().split("T")[0];

  const { state, refresh } = useApi<DashData>(async () => {
    const [shifts, leaveRequests] = await Promise.all([
      shiftsApi.getMyShifts(),
      leaveApi.listLeave(),
    ]);
    return { shifts, leaveRequests };
  });

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

  const { shifts, leaveRequests } = state.data;
  const todayShift = shifts.find((s) => s.date.split("T")[0] === today);
  const pendingLeave = leaveRequests.filter((l) => l.status === "PENDING").length;
  const approvedDays = leaveRequests
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => {
      const diff = Math.round(
        (new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000
      ) + 1;
      return sum + diff;
    }, 0);
  const remainingDays = Math.max(0, TOTAL_LEAVE_DAYS - approvedDays);

  const shiftDotColor = (s: ApiShift) => (
    s.type === "MORNING" ? colors.success : s.type === "EVENING" ? colors.info : colors.primary
  );

  const stats = [
    {
      key: "upcoming", label: "Upcoming Shift",
      value: todayShift ? `Today, ${todayShift.startTime}` : "No shift today",
      sub: todayShift?.ward ?? "—",
      icon: CalendarDays, tint: colors.primaryTint, fg: colors.primary,
      action: "View Schedule", onPress: () => router.push("/(tabs)/schedule"),
    },
    {
      key: "week", label: "This Week", value: String(shifts.length), sub: "Shifts Assigned",
      icon: CalendarCheck, tint: colors.successTint, fg: colors.success,
    },
    {
      key: "leave", label: "Leave Status", value: String(pendingLeave), sub: "Pending Requests",
      icon: CalendarClock, tint: colors.warningTint, fg: colors.warning,
    },
    {
      key: "balance", label: "Leave Balance", value: String(remainingDays), sub: "Days remaining",
      icon: Bell, tint: colors.dangerTint, fg: colors.danger,
      action: "View history", onPress: () => router.push("/leave/history"),
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={state.status === "loading"} onRefresh={refresh} tintColor={colors.primary} />
      }
    >
      <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good morning, {user?.name?.split(" ")[0] ?? "Nurse"}! 👋
            </Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              Here is your overview for today.
            </Text>
          </View>
          <Pressable onPress={() => router.push("/notifications")} hitSlop={8}>
            <View style={[styles.bellCircle, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Bell size={20} color={colors.text} />
            </View>
          </Pressable>
          <Pressable onPress={() => router.push("/profile")} style={{ marginLeft: 10 }}>
            <Avatar uri={user?.avatar} name={user?.name ?? "Nurse"} size={44} />
          </Pressable>
        </View>

        {/* Stat cards */}
        <View style={styles.statGrid}>
          {stats.map((s) => (
            <Card key={s.key} style={[styles.statCard, { backgroundColor: s.tint, borderColor: "transparent" }]}>
              <View style={styles.statTopRow}>
                <Text style={[styles.statLabel, { color: s.fg }]}>{s.label}</Text>
                <s.icon size={18} color={s.fg} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
              <Text style={[styles.statSub, { color: colors.textSecondary }]}>{s.sub}</Text>
              {s.action && (
                <Pressable onPress={s.onPress} style={styles.statAction} hitSlop={6}>
                  <Text style={[styles.statActionText, { color: s.fg }]}>{s.action}</Text>
                  <ChevronRight size={14} color={s.fg} />
                </Pressable>
              )}
            </Card>
          ))}
        </View>

        <View style={isTablet ? styles.tabletRow : undefined}>
          {/* Weekly schedule */}
          <Card style={[styles.sectionCard, isTablet && { flex: 1.4, marginRight: 14 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Schedule (This Week)</Text>
              <Pressable onPress={() => router.push("/schedule/full")}>
                <Text style={[styles.link, { color: colors.primary }]}>View full schedule</Text>
              </Pressable>
            </View>
            {shifts.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No shifts assigned this week.</Text>
            ) : shifts.map((shift) => {
              const dateObj = new Date(shift.date);
              const dayStr = dateObj.toLocaleDateString(undefined, { weekday: "short" });
              const dateLabel = dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short" });
              const isToday = shift.date.split("T")[0] === today;
              return (
                <Pressable
                  key={shift.id}
                  onPress={() => router.push(`/schedule/${shift.id}`)}
                  style={[styles.shiftRow, { borderBottomColor: colors.border }]}
                >
                  <View style={{ width: 46 }}>
                    {isToday && (
                      <View style={[styles.todayPill, { backgroundColor: colors.primary }]}>
                        <Text style={styles.todayPillText}>TODAY</Text>
                      </View>
                    )}
                    <Text style={[styles.dayLabel, { color: colors.text }]}>{dayStr}</Text>
                    <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{dateLabel}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.timeLabel, { color: colors.text }]}>
                      {shift.startTime} – {shift.endTime}
                    </Text>
                    <Text style={[styles.shiftType, { color: colors.textSecondary }]}>{shiftLabel(shift)}</Text>
                  </View>
                  <View style={styles.wardWrap}>
                    <View style={[styles.wardDot, { backgroundColor: shiftDotColor(shift) }]} />
                    <Text style={[styles.wardText, { color: colors.textSecondary }]}>{shift.ward}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </Card>

          <View style={isTablet ? { flex: 1 } : undefined}>
            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Leave Balance</Text>
              <View style={{ alignItems: "center", paddingVertical: 8 }}>
                <ProgressRing size={140} strokeWidth={14} progress={remainingDays / TOTAL_LEAVE_DAYS} color={colors.primary} trackColor={colors.primaryTint}>
                  <Text style={[styles.ringValue, { color: colors.text }]}>{remainingDays}</Text>
                  <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>Days Left</Text>
                </ProgressRing>
                <Text style={[styles.ringTotal, { color: colors.textMuted }]}>/ {TOTAL_LEAVE_DAYS} Total Days</Text>
              </View>
              <Pressable onPress={() => router.push("/leave/history")} style={[styles.linkRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.link, { color: colors.primary }]}>View leave history</Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Quick Actions</Text>
              <QuickAction icon={FileClock} label="Request Leave" onPress={() => router.push("/leave/apply")} />
              <QuickAction icon={CalendarCog} label="Update Availability" onPress={() => router.push("/(tabs)/availability")} />
              <QuickAction icon={Repeat} label="Swap Shift" onPress={() => router.push("/(tabs)/schedule")} last />
            </Card>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon: Icon, label, onPress, last }: { icon: any; label: string; onPress: () => void; last?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={[styles.quickAction, { backgroundColor: colors.primaryTint, marginBottom: last ? 0 : 10 }]}>
      <Icon size={18} color={colors.primary} />
      <Text style={[styles.quickActionText, { color: colors.primary }]}>{label}</Text>
      <ChevronRight size={16} color={colors.primary} style={{ marginLeft: "auto" }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: "800" },
  subGreeting: { fontSize: 13, marginTop: 2 },
  bellCircle: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  statCard: { width: "47.5%", minHeight: 128 },
  statTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 12, fontWeight: "700" },
  statValue: { fontSize: 20, fontWeight: "800", marginTop: 10 },
  statSub: { fontSize: 12, marginTop: 2 },
  statAction: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 10 },
  statActionText: { fontSize: 12, fontWeight: "700" },
  tabletRow: { flexDirection: "row", alignItems: "flex-start" },
  sectionCard: { marginBottom: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  link: { fontSize: 13, fontWeight: "700" },
  shiftRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  todayPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start", marginBottom: 3 },
  todayPillText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  dayLabel: { fontSize: 13, fontWeight: "700" },
  dateLabel: { fontSize: 11 },
  timeLabel: { fontSize: 14, fontWeight: "700" },
  shiftType: { fontSize: 12, marginTop: 2 },
  wardWrap: { flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 },
  wardDot: { width: 7, height: 7, borderRadius: 4 },
  wardText: { fontSize: 12 },
  ringValue: { fontSize: 30, fontWeight: "800" },
  ringLabel: { fontSize: 12, marginTop: 2 },
  ringTotal: { fontSize: 12, marginTop: 6 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, marginTop: 6 },
  quickAction: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  quickActionText: { fontSize: 13, fontWeight: "700" },
});
