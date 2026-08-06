import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, ChevronRight, UserPlus } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApi } from "@/hooks/useApi";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { LoadingView, ErrorView } from "@/components/StateViews";
import * as nursesApi from "@/api/nurses";
import type { ApiUser } from "@/api/types";

const WARD_FILTERS = ["All", "Medical Ward", "Surgical Ward", "ICU", "Emergency"];

export default function HRNursesTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [query, setQuery] = useState("");
  const [ward, setWard] = useState("All");

  const { state, refresh } = useApi<ApiUser[]>(
    () => nursesApi.listNurses({ search: query, ward }),
    [query, ward]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Nurses</Text>
        <Pressable onPress={() => router.push("/hr/add-nurse")} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <UserPlus size={16} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.searchWrap, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search nurses..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {WARD_FILTERS.map((w) => (
              <Pressable
                key={w}
                onPress={() => setWard(w)}
                style={[styles.chip, { backgroundColor: ward === w ? colors.primary : colors.surfaceAlt, borderColor: ward === w ? colors.primary : colors.border }]}
              >
                <Text style={{ color: ward === w ? "#fff" : colors.textSecondary, fontSize: 12, fontWeight: "700" }}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {state.status === "loading" ? (
        <LoadingView />
      ) : state.status === "error" ? (
        <ErrorView message={state.message} onRetry={refresh} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.primary} />}
        >
          <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
            <Text style={[styles.resultCount, { color: colors.textMuted }]}>
              {state.data.length} {state.data.length === 1 ? "nurse" : "nurses"}
            </Text>
            {state.data.map((n) => (
              <Pressable key={n.id} onPress={() => router.push(`/hr/nurse/${n.id}`)}>
                <Card style={styles.nurseRow}>
                  <Avatar uri={n.avatar} name={n.name} size={48} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.nurseName, { color: colors.text }]}>{n.name}</Text>
                    <Text style={[styles.nurseWard, { color: colors.textSecondary }]}>{n.ward}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <View style={[styles.statusPill, { backgroundColor: n.status === "ACTIVE" ? colors.successTint : colors.warningTint }]}>
                      <Text style={{ color: n.status === "ACTIVE" ? colors.success : colors.warning, fontSize: 11, fontWeight: "700" }}>
                        {n.status === "ACTIVE" ? "Active" : "On Leave"}
                      </Text>
                    </View>
                    {n.shiftsThisWeek !== undefined && (
                      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>{n.shiftsThisWeek} shifts</Text>
                    )}
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                </Card>
              </Pressable>
            ))}
            {state.data.length === 0 && (
              <Card style={{ alignItems: "center", paddingVertical: 30 }}>
                <Text style={{ color: colors.textSecondary }}>No nurses match your search.</Text>
              </Card>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14, height: "100%" },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  page: { paddingHorizontal: 16, paddingTop: 14 },
  resultCount: { fontSize: 12, marginBottom: 10 },
  nurseRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  nurseName: { fontSize: 14, fontWeight: "700" },
  nurseWard: { fontSize: 12, marginTop: 3 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
});
