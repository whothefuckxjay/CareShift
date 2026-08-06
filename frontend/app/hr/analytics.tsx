import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { PieChart, LineChart } from "react-native-chart-kit";
import { MapPin, ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import ProgressRing from "@/components/ProgressRing";
import { coverageBreakdown, understaffedShifts, weekCoverage } from "@/data/mockData";

export default function HRAnalyticsScreen() {
  const { colors } = useAppTheme();
  const { contentMaxWidth, width } = useResponsive();
  const chartWidth = Math.min(width, contentMaxWidth ?? width) - 56;

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(109, 93, 244, ${opacity})`,
    labelColor: () => colors.textSecondary,
    propsForBackgroundLines: { stroke: colors.border },
    propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary },
  };

  const weeklyCoveragePct = weekCoverage.map((d) => {
    const filled = d.morning.filled + d.evening.filled + d.night.filled;
    const required = d.morning.required + d.evening.required + d.night.required;
    return Math.round((filled / required) * 100);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Coverage Analytics" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Card style={{ alignItems: "center", paddingVertical: 20, marginTop: 14 }}>
            <ProgressRing size={130} strokeWidth={13} progress={coverageBreakdown.overallCoverage / 100} color={colors.success} trackColor={colors.successTint}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>{coverageBreakdown.overallCoverage}%</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Overall</Text>
            </ProgressRing>

            <View style={styles.legendGrid}>
              <LegendRow color={colors.success} label="Fully Covered" pct={coverageBreakdown.fullyCoveredPct} shifts={coverageBreakdown.fullyCoveredShifts} />
              <LegendRow color={colors.warning} label="Partially Covered" pct={coverageBreakdown.partiallyCoveredPct} shifts={coverageBreakdown.partiallyCoveredShifts} />
              <LegendRow color={colors.danger} label="Understaffed" pct={coverageBreakdown.understaffedPct} shifts={coverageBreakdown.understaffedShifts} />
            </View>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Coverage Trend (This Week)</Text>
            <LineChart
              data={{ labels: weekCoverage.map((d) => d.day), datasets: [{ data: weeklyCoveragePct }] }}
              width={chartWidth}
              height={190}
              fromZero
              yAxisSuffix="%"
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 12, marginLeft: -16 }}
            />
          </Card>

          <Card style={{ marginTop: 16 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Coverage Breakdown</Text>
            <PieChart
              data={[
                { name: "Fully Covered", population: coverageBreakdown.fullyCoveredShifts, color: colors.success, legendFontColor: colors.textSecondary, legendFontSize: 12 },
                { name: "Partially Covered", population: coverageBreakdown.partiallyCoveredShifts, color: colors.warning, legendFontColor: colors.textSecondary, legendFontSize: 12 },
                { name: "Understaffed", population: coverageBreakdown.understaffedShifts, color: colors.danger, legendFontColor: colors.textSecondary, legendFontSize: 12 },
              ]}
              width={chartWidth}
              height={190}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
            />
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Understaffed Shifts</Text>
          </View>
          {understaffedShifts.map((s) => (
            <Card key={s.id} style={styles.shiftRow}>
              <View style={[styles.dateBox, { backgroundColor: colors.dangerTint }]}>
                <Text style={[styles.dateBoxText, { color: colors.danger }]}>{s.date.split(" ")[0]}</Text>
                <Text style={[styles.dateBoxMonth, { color: colors.danger }]}>{s.date.split(" ")[1]}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.shiftLabel, { color: colors.text }]}>{s.label}</Text>
                <View style={styles.wardRow}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{s.ward}</Text>
                </View>
              </View>
              <Text style={[styles.fillCount, { color: colors.danger }]}>
                {s.filled}/{s.required}
              </Text>
              <ChevronRight size={16} color={colors.textMuted} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function LegendRow({ color, label, pct, shifts }: { color: string; label: string; pct: number; shifts: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.legendValue, { color: colors.textMuted }]}>
        {pct}% ({shifts} shifts)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  legendGrid: { width: "100%", marginTop: 18, gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  legendLabel: { fontSize: 13, fontWeight: "600", flex: 1 },
  legendValue: { fontSize: 12 },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  sectionHeader: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  shiftRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dateBox: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dateBoxText: { fontSize: 14, fontWeight: "800" },
  dateBoxMonth: { fontSize: 10, fontWeight: "700" },
  shiftLabel: { fontSize: 13, fontWeight: "700" },
  wardRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  fillCount: { fontSize: 13, fontWeight: "800", marginRight: 8 },
});
