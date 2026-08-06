import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { ChevronRight, MapPin } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import { weekSchedule } from "@/data/mockData";

export default function FullScheduleScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const marks = useMemo(() => {
    const marked: Record<string, any> = {};
    weekSchedule.forEach((s) => {
      if (s.label === "No Shift Assigned") return;
      marked[s.date] = { marked: true, dotColor: (colors as any)[s.color] ?? colors.primary };
    });
    return marked;
  }, [colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Full Schedule" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Card style={{ padding: 8, marginTop: 14 }}>
            <Calendar
              current="2025-05-12"
              markedDates={marks}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textMuted,
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textMuted,
                monthTextColor: colors.text,
                arrowColor: colors.primary,
              }}
            />
          </Card>

          <Text style={[styles.heading, { color: colors.text }]}>All Shifts This Month</Text>
          {weekSchedule
            .filter((s) => s.label !== "No Shift Assigned")
            .map((shift) => (
              <Pressable key={shift.id} onPress={() => router.push(`/schedule/${shift.id}`)}>
                <Card style={styles.row}>
                  <View style={[styles.dateBox, { backgroundColor: colors.primaryTint }]}>
                    <Text style={[styles.dateBoxDay, { color: colors.primary }]}>{shift.dateLabel.split(" ")[0]}</Text>
                    <Text style={[styles.dateBoxMonth, { color: colors.primary }]}>{shift.dateLabel.split(" ")[1]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.shiftLabel, { color: colors.text }]}>{shift.label}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
                      {shift.start} - {shift.end}
                    </Text>
                    <View style={styles.wardRow}>
                      <MapPin size={12} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{shift.ward}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </Card>
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  heading: { fontSize: 15, fontWeight: "700", marginTop: 22, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dateBox: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dateBoxDay: { fontSize: 14, fontWeight: "800" },
  dateBoxMonth: { fontSize: 10, fontWeight: "700" },
  shiftLabel: { fontSize: 14, fontWeight: "700" },
  wardRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
});
