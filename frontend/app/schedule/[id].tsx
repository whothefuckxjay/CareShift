import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, MapPin, User, Repeat, CalendarX2 } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useApi } from "@/hooks/useApi";
import * as shiftsApi from "@/api/shifts";
import type { ApiShift } from "@/api/types";

function shiftLabel(s: ApiShift) {
  return s.type === "MORNING" ? "Morning Shift" : s.type === "EVENING" ? "Evening Shift" : "Night Shift";
}

export default function ShiftDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contentMaxWidth } = useResponsive();

  const { state, refresh } = useApi<ApiShift>(() => shiftsApi.getShift(id ?? ""), [id]);

  if (state.status === "loading") return <View style={{ flex: 1, backgroundColor: colors.background }}><LoadingView /></View>;
  if (state.status === "error") return <View style={{ flex: 1, backgroundColor: colors.background }}><ErrorView message={state.message} onRetry={refresh} /></View>;

  const shift = state.data;
  const dateObj = new Date(shift.date);
  const dateStr = dateObj.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Shift Details" showBell={false} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Card style={[styles.heroCard, { backgroundColor: colors.primaryTint }]}>
            <Text style={[styles.heroLabel, { color: colors.primary }]}>{shiftLabel(shift)}</Text>
            <Text style={[styles.heroDate, { color: colors.text }]}>{dateStr}</Text>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <DetailRow icon={Clock} label="Time" value={`${shift.startTime} – ${shift.endTime}`} colors={colors} />
            <DetailRow icon={MapPin} label="Ward" value={shift.ward} colors={colors} />
            {shift.nurse && (
              <DetailRow icon={User} label="Assigned Nurse" value={shift.nurse.name} colors={colors} last />
            )}
          </Card>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => Alert.alert("Swap requested", "Your shift swap request has been sent to your manager.")}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Repeat size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Request Swap</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/leave/apply")}
              style={[styles.actionBtn, { backgroundColor: colors.dangerTint }]}
            >
              <CalendarX2 size={16} color={colors.danger} />
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>Report Absence</Text>
            </Pressable>
          </View>
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
  heroCard: { alignItems: "center", paddingVertical: 24, marginTop: 16 },
  heroLabel: { fontSize: 13, fontWeight: "700" },
  heroDate: { fontSize: 20, fontWeight: "800", marginTop: 6, textAlign: "center" },
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  detailIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
