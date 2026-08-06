import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";

const WARDS = ["Medical Ward", "Surgical Ward", "ICU", "Pediatrics", "Emergency"];
const MAX_SHIFTS = [3, 4, 5, 6];

export default function AvailabilityPreferencesScreen() {
  const { colors } = useAppTheme();
  const { contentMaxWidth } = useResponsive();
  const [preferredWards, setPreferredWards] = useState<string[]>(["Medical Ward", "ICU"]);
  const [maxShifts, setMaxShifts] = useState(5);
  const [nightShiftsOk, setNightShiftsOk] = useState(true);

  const toggleWard = (w: string) => {
    setPreferredWards((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My Preferences" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Text style={[styles.label, { color: colors.text }]}>Preferred Wards</Text>
          <View style={styles.chipRow}>
            {WARDS.map((w) => {
              const active = preferredWards.includes(w);
              return (
                <Pressable
                  key={w}
                  onPress={() => toggleWard(w)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.primary : colors.surfaceAlt, borderColor: active ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={{ color: active ? "#fff" : colors.textSecondary, fontSize: 12, fontWeight: "700" }}>{w}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: 22 }]}>Max Shifts per Week</Text>
          <View style={styles.chipRow}>
            {MAX_SHIFTS.map((n) => {
              const active = maxShifts === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setMaxShifts(n)}
                  style={[
                    styles.numChip,
                    { backgroundColor: active ? colors.primary : colors.surfaceAlt, borderColor: active ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={{ color: active ? "#fff" : colors.textSecondary, fontWeight: "700" }}>{n}</Text>
                </Pressable>
              );
            })}
          </View>

          <Card style={styles.toggleCard}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>Available for Night Shifts</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>
                Allow scheduling for overnight (11PM - 7AM) shifts
              </Text>
            </View>
            <Pressable
              onPress={() => setNightShiftsOk((v) => !v)}
              style={[styles.switchTrack, { backgroundColor: nightShiftsOk ? colors.primary : colors.border }]}
            >
              <View style={[styles.switchThumb, { alignSelf: nightShiftsOk ? "flex-end" : "flex-start" }]} />
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 16 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  numChip: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  toggleCard: { flexDirection: "row", alignItems: "center", marginTop: 24 },
  switchTrack: { width: 46, height: 26, borderRadius: 13, padding: 3, justifyContent: "center" },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
});
