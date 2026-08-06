import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import * as leaveApi from "@/api/leave";
import { apiErrorMessage } from "@/api/client";
import type { LeaveType } from "@/api/types";

const LEAVE_TYPES: { key: LeaveType; label: string }[] = [
  { key: "ANNUAL", label: "Annual Leave" },
  { key: "SICK", label: "Sick Leave" },
  { key: "PERSONAL", label: "Personal Leave" },
  { key: "EMERGENCY", label: "Emergency Leave" },
];

export default function ApplyLeaveScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const [type, setType] = useState<LeaveType>("ANNUAL");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const onDayPress = (day: { dateString: string }) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (day.dateString < startDate) {
      setStartDate(day.dateString);
    } else {
      setEndDate(day.dateString);
    }
  };

  const markedDates = (): Record<string, any> => {
    if (!startDate) return {};
    if (!endDate) return { [startDate]: { startingDay: true, endingDay: true, color: colors.primary, textColor: "#fff" } };
    const range: Record<string, any> = {};
    let cur = new Date(startDate);
    const end = new Date(endDate);
    while (cur <= end) {
      const iso = cur.toISOString().split("T")[0];
      range[iso] = {
        color: colors.primary, textColor: "#fff",
        startingDay: iso === startDate, endingDay: iso === endDate,
      };
      cur.setDate(cur.getDate() + 1);
    }
    return range;
  };

  const onSubmit = async () => {
    if (!startDate) {
      Alert.alert("Select dates", "Please choose a start date for your leave.");
      return;
    }
    setLoading(true);
    try {
      await leaveApi.applyForLeave({
        type,
        startDate,
        endDate: endDate ?? startDate,
        reason: reason.trim() || undefined,
      });
      Alert.alert("Request submitted", "Your leave request has been sent for approval.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Apply for Leave" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Text style={[styles.label, { color: colors.text }]}>Leave Type</Text>
          <View style={styles.typeRow}>
            {LEAVE_TYPES.map((t) => {
              const active = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[styles.typeChip, { backgroundColor: active ? colors.primary : colors.surfaceAlt, borderColor: active ? colors.primary : colors.border }]}
                >
                  <Text style={{ color: active ? "#fff" : colors.textSecondary, fontSize: 12, fontWeight: "700" }}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Select Dates</Text>
          <Card style={{ padding: 8 }}>
            <Calendar
              onDayPress={onDayPress}
              markingType="period"
              markedDates={markedDates()}
              theme={{
                backgroundColor: colors.surface, calendarBackground: colors.surface,
                textSectionTitleColor: colors.textMuted, dayTextColor: colors.text,
                todayTextColor: colors.primary, monthTextColor: colors.text,
                arrowColor: colors.primary, textDisabledColor: colors.textMuted,
              }}
            />
          </Card>
          {startDate ? (
            <Text style={[styles.dateSummary, { color: colors.textSecondary }]}>
              {startDate}{endDate ? `  →  ${endDate}` : "  (tap an end date, or leave as single day)"}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Reason (optional)</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Add any additional details..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          />

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Request</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 16 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  dateSummary: { fontSize: 12, marginTop: 10, textAlign: "center" },
  textArea: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, textAlignVertical: "top", minHeight: 100 },
  submitBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 26 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
