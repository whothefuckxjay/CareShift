import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { FileBarChart2, Download, Clock } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import { reportsList } from "@/data/mockData";

export default function ReportsScreen() {
  const { colors } = useAppTheme();
  const { contentMaxWidth } = useResponsive();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const onGenerate = (title: string, id: string) => {
    setGeneratingId(id);
    setTimeout(() => {
      setGeneratingId(null);
      Alert.alert("Report ready", `${title} has been generated and is ready to download.`);
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Reports" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          {reportsList.map((r) => (
            <Card key={r.id} style={{ marginBottom: 12 }}>
              <View style={styles.topRow}>
                <View style={[styles.icon, { backgroundColor: colors.primaryTint }]}>
                  <FileBarChart2 size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{r.title}</Text>
                  <Text style={[styles.desc, { color: colors.textSecondary }]}>{r.description}</Text>
                </View>
              </View>
              <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
                <View style={styles.lastGenRow}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>Last generated {r.lastGenerated}</Text>
                </View>
                <Pressable
                  onPress={() => onGenerate(r.title, r.id)}
                  style={[styles.generateBtn, { backgroundColor: colors.primary, opacity: generatingId === r.id ? 0.6 : 1 }]}
                  disabled={generatingId === r.id}
                >
                  <Download size={14} color="#fff" />
                  <Text style={styles.generateBtnText}>{generatingId === r.id ? "Generating…" : "Generate"}</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 14 },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 12 },
  lastGenRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  generateBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  generateBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
