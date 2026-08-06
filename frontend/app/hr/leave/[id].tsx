import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, X, CalendarRange, Building2, FileText } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useApi } from "@/hooks/useApi";
import * as leaveApi from "@/api/leave";
import { apiErrorMessage } from "@/api/client";
import type { ApiLeaveRequest } from "@/api/types";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual Leave", PERSONAL: "Personal Leave", SICK: "Sick Leave", EMERGENCY: "Emergency Leave",
};

function toDisplayStatus(s: string): "Approved" | "Pending" | "Rejected" {
  return (s.charAt(0) + s.slice(1).toLowerCase()) as any;
}

export default function HRLeaveDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contentMaxWidth } = useResponsive();
  const [actioning, setActioning] = useState(false);

  const { state, refresh, setData } = useApi<ApiLeaveRequest>(
    () => leaveApi.getLeave(id ?? ""),
    [id]
  );

  const decide = async (status: "APPROVED" | "REJECTED") => {
    if (!state.data) return;
    setActioning(true);
    try {
      const updated = await leaveApi.updateLeaveStatus(id ?? "", status);
      setData(updated);
      Alert.alert(
        status === "APPROVED" ? "Approved" : "Rejected",
        `Leave request has been ${status.toLowerCase()}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert("Error", apiErrorMessage(err));
    } finally {
      setActioning(false);
    }
  };

  if (state.status === "loading") return <View style={{ flex: 1, backgroundColor: colors.background }}><LoadingView /></View>;
  if (state.status === "error") return <View style={{ flex: 1, backgroundColor: colors.background }}><ErrorView message={state.message} onRetry={refresh} /></View>;

  const lr = state.data;
  const startStr = new Date(lr.startDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const endStr = new Date(lr.endDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const range = startStr === endStr ? startStr : `${startStr} – ${endStr}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Leave Request" showBell={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={styles.avatarWrap}>
            <Avatar uri={lr.nurse?.avatar ?? null} name={lr.nurse?.name ?? "Nurse"} size={80} />
            <Text style={[styles.name, { color: colors.text }]}>{lr.nurse?.name}</Text>
            <Text style={[styles.ward, { color: colors.textSecondary }]}>{lr.nurse?.ward}</Text>
            <View style={{ marginTop: 10 }}>
              <StatusBadge status={toDisplayStatus(lr.status)} />
            </View>
          </View>

          <Card>
            <DetailRow icon={FileText} label="Leave Type" value={TYPE_LABELS[lr.type] ?? lr.type} colors={colors} />
            <DetailRow icon={CalendarRange} label="Dates" value={range} colors={colors} />
            <DetailRow icon={Building2} label="Department" value={lr.nurse?.ward ?? "—"} colors={colors} last />
          </Card>

          {lr.reason ? (
            <Card style={{ marginTop: 12 }}>
              <Text style={[styles.reasonLabel, { color: colors.textMuted }]}>Reason</Text>
              <Text style={[styles.reasonText, { color: colors.text }]}>{lr.reason}</Text>
            </Card>
          ) : null}

          {lr.status === "PENDING" && (
            <View style={styles.actionsRow}>
              <Pressable onPress={() => decide("REJECTED")} disabled={actioning} style={[styles.actionBtn, { backgroundColor: colors.dangerTint, opacity: actioning ? 0.6 : 1 }]}>
                {actioning ? <ActivityIndicator size="small" color={colors.danger} /> : <X size={18} color={colors.danger} />}
                <Text style={[styles.actionBtnText, { color: colors.danger }]}>Reject</Text>
              </Pressable>
              <Pressable onPress={() => decide("APPROVED")} disabled={actioning} style={[styles.actionBtn, { backgroundColor: colors.success, opacity: actioning ? 0.6 : 1 }]}>
                {actioning ? <ActivityIndicator size="small" color="#fff" /> : <Check size={18} color="#fff" />}
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>Approve</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon: Icon, label, value, colors, last }: any) {
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[styles.detailIcon, { backgroundColor: colors.primaryTint }]}>
        <Icon size={16} color={colors.primary} />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  avatarWrap: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  name: { fontSize: 18, fontWeight: "800", marginTop: 12 },
  ward: { fontSize: 13, marginTop: 4 },
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  detailIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  reasonLabel: { fontSize: 11, marginBottom: 4 },
  reasonText: { fontSize: 13 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 22 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  actionBtnText: { fontWeight: "700", fontSize: 14 },
});
