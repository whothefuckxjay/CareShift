import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mail, Phone, Briefcase, CalendarCheck, MessageCircle, Trash2 } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { LoadingView, ErrorView } from "@/components/StateViews";
import { useApi } from "@/hooks/useApi";
import * as nursesApi from "@/api/nurses";
import { apiErrorMessage } from "@/api/client";
import type { ApiUser } from "@/api/types";

export default function HRNurseDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contentMaxWidth } = useResponsive();
  const [deleting, setDeleting] = useState(false);

  const { state, refresh } = useApi<ApiUser>(() => nursesApi.getNurse(id ?? ""), [id]);

  if (state.status === "loading") return <View style={{ flex: 1, backgroundColor: colors.background }}><LoadingView /></View>;
  if (state.status === "error") return <View style={{ flex: 1, backgroundColor: colors.background }}><ErrorView message={state.message} onRetry={refresh} /></View>;

  const nurse = state.data;

  const onDeletePress = () => {
    Alert.alert(
      "Delete Nurse",
      `Are you sure you want to delete ${nurse.name}? This will permanently remove their account, shifts, leave requests, availability and messages. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await nursesApi.deleteNurse(nurse.id);
              router.replace("/(hr)/hr-nurses");
            } catch (err) {
              setDeleting(false);
              Alert.alert("Couldn't delete nurse", apiErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Nurse Profile" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={styles.avatarWrap}>
            <Avatar uri={nurse.avatar} name={nurse.name} size={92} />
            <Text style={[styles.name, { color: colors.text }]}>{nurse.name}</Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>Staff Nurse · {nurse.ward}</Text>
            <View style={[styles.statusPill, { backgroundColor: nurse.status === "ACTIVE" ? colors.successTint : colors.warningTint }]}>
              <Text style={{ color: nurse.status === "ACTIVE" ? colors.success : colors.warning, fontSize: 12, fontWeight: "700" }}>
                {nurse.status === "ACTIVE" ? "Active" : "On Leave"}
              </Text>
            </View>
          </View>

          <Card>
            {nurse.email ? <DetailRow icon={Mail} label="Email" value={nurse.email} colors={colors} /> : null}
            {nurse.phone ? <DetailRow icon={Phone} label="Phone" value={nurse.phone} colors={colors} /> : null}
            <DetailRow icon={Briefcase} label="Ward" value={nurse.ward ?? "—"} colors={colors} />
            {nurse.shiftsThisWeek !== undefined ? (
              <DetailRow icon={CalendarCheck} label="Shifts This Week" value={String(nurse.shiftsThisWeek)} colors={colors} last />
            ) : null}
          </Card>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/messages/[id]",
                  params: { id: nurse.id, name: nurse.name, avatar: nurse.avatar ?? "" },
                })
              }
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <MessageCircle size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Message</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(hr)/hr-schedule")}
              style={[styles.actionBtn, { backgroundColor: colors.primaryTint }]}
            >
              <CalendarCheck size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Adjust Shifts</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onDeletePress}
            disabled={deleting}
            style={[styles.deleteBtn, { backgroundColor: colors.dangerTint, opacity: deleting ? 0.6 : 1 }]}
          >
            {deleting ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <>
                <Trash2 size={16} color={colors.danger} />
                <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete Nurse</Text>
              </>
            )}
          </Pressable>
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
  avatarWrap: { alignItems: "center", marginTop: 24, marginBottom: 20 },
  name: { fontSize: 19, fontWeight: "800", marginTop: 12 },
  role: { fontSize: 13, marginTop: 4 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  detailIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, marginTop: 12 },
  deleteBtnText: { fontWeight: "700", fontSize: 13 },
});
