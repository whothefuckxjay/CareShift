import React from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import ProgressRing from "@/components/ProgressRing";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useApi } from "@/hooks/useApi";
import * as leaveApi from "@/api/leave";
import type { ApiLeaveRequest } from "@/api/types";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual Leave", PERSONAL: "Personal Leave", SICK: "Sick Leave", EMERGENCY: "Emergency Leave",
};

function toDisplayStatus(s: string): "Approved" | "Pending" | "Rejected" {
  return (s.charAt(0) + s.slice(1).toLowerCase()) as "Approved" | "Pending" | "Rejected";
}

const TOTAL_DAYS = 20;

export default function LeaveHistoryScreen() {
  const { colors } = useAppTheme();
  const { contentMaxWidth } = useResponsive();
  const { state, refresh } = useApi<ApiLeaveRequest[]>(() => leaveApi.listLeave());

  if (state.status === "loading") return <View style={{ flex: 1, backgroundColor: colors.background }}><LoadingView /></View>;
  if (state.status === "error") return <View style={{ flex: 1, backgroundColor: colors.background }}><ErrorView message={state.message} onRetry={refresh} /></View>;

  const requests = state.data;
  const usedDays = requests
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + Math.round((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 86400000) + 1, 0);
  const remaining = Math.max(0, TOTAL_DAYS - usedDays);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Leave History" showBell={false} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={state.status === "loading"} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Card style={{ alignItems: "center", paddingVertical: 24, marginTop: 16 }}>
            <ProgressRing size={130} strokeWidth={13} progress={remaining / TOTAL_DAYS} color={colors.primary} trackColor={colors.primaryTint}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>{remaining}</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Days Left</Text>
            </ProgressRing>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 10 }}>
              {usedDays} used of {TOTAL_DAYS} total days
            </Text>
          </Card>

          <Text style={[styles.heading, { color: colors.text }]}>All Requests</Text>
          {requests.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 28 }}>
              <Text style={{ color: colors.textSecondary }}>No leave requests yet.</Text>
            </Card>
          ) : requests.map((lr) => {
            const startStr = new Date(lr.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
            const endStr = new Date(lr.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
            const range = startStr === endStr ? startStr : `${startStr} – ${endStr}`;
            return (
              <Card key={lr.id} style={{ marginBottom: 10 }}>
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>{range}</Text>
                  <StatusBadge status={toDisplayStatus(lr.status)} />
                </View>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{TYPE_LABELS[lr.type] ?? lr.type}</Text>
                {lr.reason ? <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>{lr.reason}</Text> : null}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  heading: { fontSize: 15, fontWeight: "700", marginTop: 22, marginBottom: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
