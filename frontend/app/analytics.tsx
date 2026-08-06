import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import { weeklyHoursData, shiftDistribution } from "@/data/mockData";

export default function AnalyticsScreen() {
  const { colors } = useAppTheme();
  const { contentMaxWidth, width } = useResponsive();
  const chartWidth = Math.min(width, contentMaxWidth ?? width) - 56;

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(109, 93, 244, ${opacity})`,
    labelColor: () => colors.textSecondary,
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: colors.border },
  };

  const totalHours = weeklyHoursData.data.reduce((a, b) => a + b, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My Analytics" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={styles.summaryRow}>
            <Card style={[styles.summaryCard, { backgroundColor: colors.primaryTint }]}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{totalHours}h</Text>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Hours this week</Text>
            </Card>
            <Card style={[styles.summaryCard, { backgroundColor: colors.successTint }]}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>5</Text>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Shifts worked</Text>
            </Card>
          </View>

          <Card style={{ marginTop: 16 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Hours Worked This Week</Text>
            <BarChart
              data={{
                labels: weeklyHoursData.labels,
                datasets: [{ data: weeklyHoursData.data }],
              }}
              width={chartWidth}
              height={200}
              fromZero
              yAxisLabel=""
              yAxisSuffix="h"
              chartConfig={chartConfig}
              style={{ borderRadius: 12, marginLeft: -16 }}
              showValuesOnTopOfBars
            />
          </Card>

          <Card style={{ marginTop: 16 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Shift Type Distribution</Text>
            <PieChart
              data={shiftDistribution.map((s) => ({
                name: s.name,
                population: s.value,
                color: s.color,
                legendFontColor: colors.textSecondary,
                legendFontSize: 12,
              }))}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
            />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 16 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: { flex: 1, alignItems: "center", paddingVertical: 20 },
  summaryValue: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 4 },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
});
