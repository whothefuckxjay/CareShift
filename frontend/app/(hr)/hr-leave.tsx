import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Check, X, ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as leaveApi from "@/api/leave";
import { apiErrorMessage } from "@/api/client";
import type { ApiLeaveRequest, LeaveStatus } from "@/api/types";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual Leave", PERSONAL: "Personal Leave", SICK: "Sick Leave", EMERGENCY: "Emergency Leave",
};
const TABS: { key: LeaveStatus; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

function toDisplayStatus(s: string): "Approved" | "Pending" | "Rejected" {
  return (s.charAt(0) + s.slice(1).toLowerCase()) as any;
}

export default function HRLeaveTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [tab, setTab] = useState<LeaveStatus>("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const { state, refresh, setData } = useApi<ApiLeaveRequest[]>(
    () => leaveApi.listLeave(tab),
    [tab]
  );

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActioningId(id);
    try {
      const updated = await leaveApi.updateLeaveStatus(id, status);
      if (state.status === "ok") {
        setData(state.data.filter((r) => r.id !== updated.id));
      }
      Alert.alert(
        status === "APPROVED" ? "Approved" : "Rejected",
        `Leave request has been ${status.toLowerCase()}.`
      );
    } catch (err) {
      Alert.alert("Error", apiErrorMessage(err));
    } finally {
      setActioningId(null);
    }
  };

  const filtered = state.status === "ok" ? state.data : [];

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
          <View style={[styles.segment, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            {TABS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[styles.segmentBtn, tab === t.key && { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.segmentText, { color: tab === t.key ? "#fff" : colors.textSecondary }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {state.status === "loading" ? (
            <LoadingView />
          ) : state.status === "error" ? (
            <ErrorView message={state.message} onRetry={refresh} />
          ) : filtered.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 30 }}>
              <Text style={{ color: colors.textSecondary }}>No {tab.toLowerCase()} requests.</Text>
            </Card>
          ) : filtered.map((lr) => {
            const startStr = new Date(lr.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
            const endStr = new Date(lr.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
            const range = startStr === endStr ? startStr : `${startStr} – ${endStr}`;
            const isActioning = actioningId === lr.id;
            return (
              <Card key={lr.id} style={{ marginBottom: 12 }}>
                <Pressable onPress={() => router.push(`/hr/leave/${lr.id}`)} style={styles.topRow}>
                  <Avatar uri={lr.nurse?.avatar ?? null} name={lr.nurse?.name ?? "Nurse"} size={44} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.name, { color: colors.text }]}>{lr.nurse?.name}</Text>
                    <Text style={[styles.ward, { color: colors.textMuted }]}>{lr.nurse?.ward}</Text>
                  </View>
                  <StatusBadge status={toDisplayStatus(lr.status)} />
                  <ChevronRight size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                </Pressable>
                <View style={[styles.detailsRow, { borderTopColor: colors.border }]}>
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>{TYPE_LABELS[lr.type] ?? lr.type}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{range}</Text>
                </View>
                {lr.status === "PENDING" && (
                  <View style={styles.actionsRow}>
                    <Pressable
                      onPress={() => decide(lr.id, "REJECTED")}
                      disabled={isActioning}
                      style={[styles.actionBtn, { backgroundColor: colors.dangerTint, opacity: isActioning ? 0.6 : 1 }]}
                    >
                      {isActioning ? <ActivityIndicator size="small" color={colors.danger} /> : <X size={16} color={colors.danger} />}
                      <Text style={[styles.actionBtnText, { color: colors.danger }]}>Reject</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => decide(lr.id, "APPROVED")}
                      disabled={isActioning}
                      style={[styles.actionBtn, { backgroundColor: colors.success, opacity: isActioning ? 0.6 : 1 }]}
                    >
                      {isActioning ? <ActivityIndicator size="small" color="#fff" /> : <Check size={16} color="#fff" />}
                      <Text style={[styles.actionBtnText, { color: "#fff" }]}>Approve</Text>
                    </Pressable>
                  </View>
                )}
              </Card>
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
  page: { paddingHorizontal: 16, paddingTop: 14 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 16 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  segmentText: { fontSize: 12, fontWeight: "700" },
  topRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "700" },
  ward: { fontSize: 11, marginTop: 2 },
  detailsRow: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 10 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 42, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontWeight: "700" },
});
