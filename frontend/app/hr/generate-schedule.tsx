import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Sparkles, CalendarCog, Check } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";

const WARDS = [
  { name: "Medical Ward", morning: 30, evening: 25, night: 20 },
  { name: "Surgical Ward", morning: 25, evening: 25, night: 18 },
  { name: "ICU", morning: 20, evening: 20, night: 20 },
  { name: "Emergency", morning: 22, evening: 22, night: 15 },
];

export default function GenerateScheduleScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const onGenerate = () => {
    setGenerating(true);
    setDone(false);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
      Alert.alert("Schedule generated", "Next week's optimal schedule is ready for review.", [
        { text: "View Schedule", onPress: () => router.push("/(hr)/hr-schedule") },
        { text: "OK", style: "cancel" },
      ]);
    }, 1400);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Generate Schedule" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Card style={[styles.heroCard, { backgroundColor: colors.primaryTint }]}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
              <Sparkles size={26} color="#fff" />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Auto-Generate Schedule</Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
              Builds next week's shift schedule from staffing requirements and everyone's saved availability.
            </Text>
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Staffing Requirements per Shift</Text>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <View style={[styles.gridHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.gridHeaderCell, { color: colors.textMuted, flex: 1.4 }]}>Ward</Text>
              <Text style={[styles.gridHeaderCell, { color: colors.textMuted }]}>AM</Text>
              <Text style={[styles.gridHeaderCell, { color: colors.textMuted }]}>PM</Text>
              <Text style={[styles.gridHeaderCell, { color: colors.textMuted }]}>Night</Text>
            </View>
            {WARDS.map((w, idx) => (
              <View
                key={w.name}
                style={[
                  styles.gridRow,
                  idx !== WARDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.wardName, { color: colors.text, flex: 1.4 }]}>{w.name}</Text>
                <Text style={[styles.wardNum, { color: colors.textSecondary }]}>{w.morning}</Text>
                <Text style={[styles.wardNum, { color: colors.textSecondary }]}>{w.evening}</Text>
                <Text style={[styles.wardNum, { color: colors.textSecondary }]}>{w.night}</Text>
              </View>
            ))}
          </Card>

          <Pressable
            onPress={onGenerate}
            disabled={generating}
            style={[styles.generateBtn, { backgroundColor: colors.primary, opacity: generating ? 0.7 : 1 }]}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : done ? (
              <>
                <Check size={18} color="#fff" />
                <Text style={styles.generateBtnText}>Generated ✓ — Tap to Regenerate</Text>
              </>
            ) : (
              <>
                <CalendarCog size={18} color="#fff" />
                <Text style={styles.generateBtnText}>Generate Now</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  heroCard: { alignItems: "center", paddingVertical: 24, marginTop: 16 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroTitle: { fontSize: 17, fontWeight: "800" },
  heroSub: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 19, paddingHorizontal: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginTop: 22, marginBottom: 10 },
  gridHeader: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  gridHeaderCell: { flex: 1, fontSize: 11, fontWeight: "700", textAlign: "center" },
  gridRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14 },
  wardName: { fontSize: 13, fontWeight: "600" },
  wardNum: { flex: 1, fontSize: 13, textAlign: "center" },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, borderRadius: 14, marginTop: 24 },
  generateBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
