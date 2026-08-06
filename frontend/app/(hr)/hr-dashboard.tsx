import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Users, CalendarDays, TrendingUp, ClipboardList, BellRing,
  ChevronRight, Sparkles, UserPlus, UserCog,
} from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as statsApi from "@/api/stats";
import * as coverageApi from "@/api/shifts";
import type { HRStats, DayCoverage } from "@/api/types";

type DashData = { stats: HRStats; coverage: DayCoverage[] };

function toDisplayStatus(s: string): "Approved" | "Pending" | "Rejected" {
  return (s.charAt(0) + s.slice(1).toLowerCase()) as "Approved" | "Pending" | "Rejected";
}

export default function HRDashboard() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, contentMaxWidth } = useResponsive();

  const { state, refresh } = useApi<DashData>(async () => {
    const [stats, coverage] = await Promise.all([
      statsApi.getHRStats(),
      coverageApi.getWeekCoverage(),
    ]);
    return { stats, coverage };
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

  const { stats, coverage } = state.data;

  const statCards = [
    { key: "nurses", label: "Total Nurses", value: String(stats.totalNurses), sub: `${stats.activeNurses} Active`, icon: Users, tint: colors.primaryTint, fg: colors.primary, action: "View all nurses", onPress: () => router.push("/(hr)/hr-nurses") },
    { key: "shifts", label: "Today's Shifts", value: String(stats.todaysShifts), sub: "Across all departments", icon: CalendarDays, tint: colors.infoTint, fg: colors.info, action: "View schedule", onPress: () => router.push("/(hr)/hr-schedule") },
    { key: "coverage", label: "Coverage Rate", value: `${stats.coverageRate}%`, sub: stats.coverageRate >= 90 ? "Excellent coverage" : "Needs attention", icon: TrendingUp, tint: colors.successTint, fg: colors.success, action: "View analytics", onPress: () => router.push("/hr/analytics") },
    { key: "pending", label: "Pending Leaves", value: String(stats.pendingLeaves), sub: "Requests to review", icon: ClipboardList, tint: colors.warningTint, fg: colors.warning, action: "Review requests", onPress: () => router.push("/(hr)/hr-leave") },
    { key: "understaffed", label: "Coverage Gaps", value: String(coverage.filter((d) => (d.morning.filled / d.morning.required) < 0.85 || (d.evening.filled / d.evening.required) < 0.85 || (d.night.filled / d.night.required) < 0.85).length), sub: "Days need attention", icon: BellRing, tint: colors.dangerTint, fg: colors.danger, action: "View schedule", onPress: () => router.push("/(hr)/hr-schedule") },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={state.status === "loading"} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.text }]}>Dashboard</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Welcome back, {user?.name?.split(" ")[0]}! Here&apos;s what&apos;s happening today.
            </Text>
          </View>
          <Pressable onPress={() => router.push("/profile")}>
            <Avatar uri={user?.avatar} name={user?.name ?? "HR"} size={44} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {statCards.map((s) => (
              <Card key={s.key} style={[styles.statCard, { backgroundColor: s.tint, borderColor: "transparent" }]}>
                <View style={styles.statTopRow}>
                  <Text style={[styles.statLabel, { color: s.fg }]}>{s.label}</Text>
                  <s.icon size={18} color={s.fg} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.statSub, { color: colors.textSecondary }]}>{s.sub}</Text>
                <Pressable onPress={s.onPress} style={styles.statAction} hitSlop={6}>
                  <Text style={[styles.statActionText, { color: s.fg }]}>{s.action}</Text>
                  <ChevronRight size={14} color={s.fg} />
                </Pressable>
              </Card>
            ))}
          </View>
        </ScrollView>

        <View style={isTablet ? styles.tabletRow : undefined}>
          {/* Coverage overview */}
          <Card style={[styles.sectionCard, isTablet && { flex: 1.3, marginRight: 14 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Schedule Coverage</Text>
              <Pressable onPress={() => router.push("/(hr)/hr-schedule")}>
                <Text style={[styles.link, { color: colors.primary }]}>Full schedule</Text>
              </Pressable>
            </View>
            {coverage.map((day) => {
              const total = day.morning.filled + day.evening.filled + day.night.filled;
              const req = day.morning.required + day.evening.required + day.night.required;
              const pct = req > 0 ? total / req : 0;
              const barColor = pct >= 0.95 ? colors.success : pct >= 0.8 ? colors.warning : colors.danger;
              return (
                <View key={day.date} style={[styles.coverageRow, { borderBottomColor: colors.border }]}>
                  <View style={{ width: 50 }}>
                    <Text style={[styles.dayLabel, { color: colors.text }]}>{day.day}</Text>
                    <Text style={[styles.dateLabel, { color: colors.textMuted }]}>
                      {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, pct * 100)}%` as any, backgroundColor: barColor }]} />
                    </View>
                  </View>
                  <Text style={[styles.coveragePct, { color: barColor }]}>{Math.round(pct * 100)}%</Text>
                </View>
              );
            })}
          </Card>

          <View style={isTablet ? { flex: 1 } : undefined}>
            {/* Pending leave requests */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Leave Requests</Text>
                <Pressable onPress={() => router.push("/(hr)/hr-leave")}>
                  <Text style={[styles.link, { color: colors.primary }]}>View all</Text>
                </Pressable>
              </View>
              {stats.pendingRequests.length === 0 ? (
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No pending requests.</Text>
              ) : stats.pendingRequests.map((lr) => (
                <Pressable key={lr.id} onPress={() => router.push(`/hr/leave/${lr.id}`)} style={[styles.leaveRow, { borderBottomColor: colors.border }]}>
                  <Avatar uri={lr.nurse?.avatar ?? null} name={lr.nurse?.name ?? "Nurse"} size={38} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.leaveName, { color: colors.text }]}>{lr.nurse?.name}</Text>
                    <Text style={[styles.leaveWard, { color: colors.textMuted }]}>{lr.nurse?.ward}</Text>
                  </View>
                  <StatusBadge status={toDisplayStatus(lr.status)} />
                </Pressable>
              ))}
              <Pressable onPress={() => router.push("/(hr)/hr-leave")} style={[styles.reviewBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.reviewBtnText}>Review all requests</Text>
                <ChevronRight size={15} color="#fff" />
              </Pressable>
            </Card>

            {/* Quick actions */}
            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Quick Actions</Text>
              <View style={styles.quickGrid}>
                <QuickAction icon={Sparkles} label="Generate Schedule" onPress={() => router.push("/hr/generate-schedule")} />
                <QuickAction icon={UserPlus} label="Add Nurse" onPress={() => router.push("/hr/add-nurse")} />
                <QuickAction icon={UserCog} label="Manage Shifts" onPress={() => router.push("/(hr)/hr-schedule")} />
                <QuickAction icon={ClipboardList} label="Reports" onPress={() => router.push("/hr/reports")} />
              </View>
            </Card>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon: Icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={[styles.quickAction, { backgroundColor: colors.primaryTint }]}>
      <Icon size={20} color={colors.primary} />
      <Text style={[styles.quickActionText, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 4 },
  statCard: { width: 200, minHeight: 128 },
  statTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 12, fontWeight: "700" },
  statValue: { fontSize: 22, fontWeight: "800", marginTop: 10 },
  statSub: { fontSize: 12, marginTop: 2 },
  statAction: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 10 },
  statActionText: { fontSize: 12, fontWeight: "700" },
  tabletRow: { flexDirection: "row", alignItems: "flex-start" },
  sectionCard: { marginBottom: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  link: { fontSize: 13, fontWeight: "700" },
  coverageRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  dayLabel: { fontSize: 13, fontWeight: "700" },
  dateLabel: { fontSize: 11 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  coveragePct: { fontSize: 12, fontWeight: "800", marginLeft: 10, width: 38, textAlign: "right" },
  leaveRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  leaveName: { fontSize: 13, fontWeight: "700" },
  leaveWard: { fontSize: 11, marginTop: 2 },
  reviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, height: 46, borderRadius: 12 },
  reviewBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickAction: { width: "47%", alignItems: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  quickActionText: { fontSize: 12, fontWeight: "700", textAlign: "center" },
});
