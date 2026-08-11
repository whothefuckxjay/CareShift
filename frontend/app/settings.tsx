import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Sun, Moon, Smartphone, Bell, Lock, ChevronRight } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const themeOptions: { key: "light" | "dark" | "system"; label: string; icon: any }[] = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Smartphone },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Settings" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <Card style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {themeOptions.map((opt) => {
              const active = preference === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setPreference(opt.key)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceAlt,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <opt.icon size={18} color={active ? "#fff" : colors.textSecondary} />
                  <Text style={[styles.themeLabel, { color: active ? "#fff" : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            <View style={[styles.rowItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primaryTint }]}>
                <Bell size={16} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Push Notifications</Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.rowItem}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primaryTint }]}>
                <Bell size={16} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Email Notifications</Text>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Pressable style={styles.rowItem} onPress={() => router.push("/change-password")}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primaryTint }]}>
                <Lock size={16} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Change Password</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  themeOption: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  themeLabel: { fontSize: 12, fontWeight: "700" },
  rowItem: { flexDirection: "row", alignItems: "center", padding: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 13, fontWeight: "600", flex: 1, marginLeft: 12 },
});
