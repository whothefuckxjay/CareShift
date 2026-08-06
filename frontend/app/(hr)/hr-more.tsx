import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Bell,
  PieChart,
  FileBarChart2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { hrProfile } from "@/data/mockData";

export default function HRMoreTab() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();

  const items = [
    { icon: User, label: "Profile", sub: "View and edit your details", onPress: () => router.push("/profile") },
    { icon: Bell, label: "Notifications", sub: "Alerts and updates", onPress: () => router.push("/notifications") },
    { icon: PieChart, label: "Coverage Analytics", sub: "Shift coverage trends by ward", onPress: () => router.push("/hr/analytics") },
    { icon: FileBarChart2, label: "Reports", sub: "Attendance, overtime & leave reports", onPress: () => router.push("/hr/reports") },
    { icon: ClipboardCheck, label: "Shift Requirements", sub: "Set required staffing per ward", onPress: () => router.push("/hr/generate-schedule") },
    { icon: Settings, label: "Settings", sub: "Appearance & preferences", onPress: () => router.push("/settings") },
    { icon: HelpCircle, label: "Help & Support", sub: "FAQs and contact", onPress: () => router.push("/help") },
  ];

  const onLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Pressable onPress={() => router.push("/profile")}>
            <Card style={styles.profileCard}>
              <Avatar uri={user?.avatar ?? hrProfile.avatar} name={user?.name ?? hrProfile.name} size={56} />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={[styles.profileName, { color: colors.text }]}>{user?.name ?? hrProfile.name}</Text>
                <Text style={[styles.profileRole, { color: colors.textSecondary }]}>
                  {user?.role ?? hrProfile.role} · {hrProfile.department}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Card>
          </Pressable>

          <Card style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
            {items.map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={[
                  styles.menuRow,
                  idx !== items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primaryTint }]}>
                  <item.icon size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: colors.textMuted }]}>{item.sub}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>

          <Pressable onPress={onLogout} style={[styles.logoutBtn, { backgroundColor: colors.dangerTint }]}>
            <LogOut size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
          </Pressable>

          <Text style={[styles.version, { color: colors.textMuted }]}>CareShift v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  page: { paddingHorizontal: 16 },
  profileCard: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileRole: { fontSize: 12, marginTop: 3 },
  menuRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600" },
  menuSub: { fontSize: 11, marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, paddingVertical: 14, borderRadius: 14 },
  logoutText: { fontWeight: "700", fontSize: 14 },
  version: { textAlign: "center", fontSize: 11, marginTop: 20 },
});
