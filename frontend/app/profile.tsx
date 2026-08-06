import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Mail, Phone, Cake, IdCard, Building2, Pencil } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { nurseProfile, hrProfile } from "@/data/mockData";

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const base = user?.portal === "hr" ? hrProfile : nurseProfile;

  const info = [
    { icon: Mail, label: "Email", value: user?.email ?? base.email },
    { icon: Phone, label: "Phone", value: base.phone },
    { icon: Cake, label: "Date of Birth", value: base.dateOfBirth },
    { icon: IdCard, label: "Employee ID", value: base.employeeId },
    { icon: Building2, label: "Department", value: base.department },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={styles.avatarWrap}>
            <Avatar uri={user?.avatar ?? base.avatar} name={user?.name ?? base.name} size={92} />
            <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? base.name}</Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>
              {user?.role ?? base.role} · {base.department}
            </Text>
          </View>

          <Card style={{ marginTop: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
            {info.map((item, idx) => (
              <View
                key={item.label}
                style={[
                  styles.infoRow,
                  idx !== info.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.infoIcon, { backgroundColor: colors.primaryTint }]}>
                  <item.icon size={16} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{item.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
                </View>
              </View>
            ))}
          </Card>

          <Pressable
            onPress={() => router.push("/profile-edit")}
            style={[styles.editButton, { borderColor: colors.primary }]}
          >
            <Pencil size={16} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  avatarWrap: { alignItems: "center", marginTop: 24, marginBottom: 20 },
  name: { fontSize: 19, fontWeight: "800", marginTop: 12 },
  role: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 18,
  },
  editButtonText: { fontWeight: "700", fontSize: 14 },
});
