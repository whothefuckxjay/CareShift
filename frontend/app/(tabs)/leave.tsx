import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarPlus2, ChevronRight, Bell } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as leaveApi from "@/api/leave";
import type { ApiLeaveRequest } from "@/api/types";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual Leave", PERSONAL: "Personal Leave", SICK: "Sick Leave", EMERGENCY: "Emergency Leave",
};

function formatDateRange(r: ApiLeaveRequest) {
  const start = new Date(r.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const end = new Date(r.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return start === end ? start : `${start} – ${end}`;
}

function toDisplayStatus(s: string): "Approved" | "Pending" | "Rejected" {
  return (s.charAt(0) + s.slice(1).toLowerCase()) as "Approved" | "Pending" | "Rejected";
}

export default function LeaveTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();

  const { state, refresh } = useApi<ApiLeaveRequest[]>(() => leaveApi.listLeave());

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

  const requests = state.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Leave Requests</Text>
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
          <Pressable
            onPress={() => router.push("/leave/apply")}
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
          >
            <CalendarPlus2 size={18} color="#fff" />
            <Text style={styles.applyBtnText}>Apply for Leave</Text>
          </Pressable>

          {requests.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 30, marginTop: 8 }}>
              <Text style={{ color: colors.textSecondary }}>You have no leave requests yet.</Text>
            </Card>
          ) : requests.map((lr) => (
            <Card key={lr.id} style={styles.requestCard}>
              <View style={styles.rowBetween}>
                <Text style={[styles.range, { color: colors.text }]}>{formatDateRange(lr)}</Text>
                <StatusBadge status={toDisplayStatus(lr.status)} />
              </View>
              <Text style={[styles.type, { color: colors.textSecondary }]}>{TYPE_LABELS[lr.type] ?? lr.type}</Text>
              {lr.reason ? (
                <Text style={[styles.note, { color: colors.textMuted }]}>{lr.reason}</Text>
              ) : null}
              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <Text style={[styles.note, { color: colors.textMuted }]}>
                  Submitted {new Date(lr.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </Card>
          ))}

          <Card style={styles.ctaCard}>
            <View style={[styles.ctaIconWrap, { backgroundColor: colors.primaryTint }]}>
              <CalendarPlus2 size={30} color={colors.primary} />
            </View>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>Need time off?</Text>
            <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>Apply for leave and relax.</Text>
            <Pressable onPress={() => router.push("/leave/apply")} style={[styles.ctaButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.ctaButtonText}>Request Leave</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  page: { paddingHorizontal: 16, paddingTop: 14 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, marginBottom: 16 },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  requestCard: { marginBottom: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  range: { fontSize: 14, fontWeight: "700" },
  type: { fontSize: 12, marginTop: 4 },
  note: { fontSize: 11, marginTop: 4 },
  ctaCard: { alignItems: "center", paddingVertical: 28, marginTop: 10 },
  ctaIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  ctaTitle: { fontSize: 16, fontWeight: "700" },
  ctaSub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  ctaButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  ctaButtonText: { color: "#fff", fontWeight: "700" },
});
