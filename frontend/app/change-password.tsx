import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import * as authApi from "@/api/auth";
import { apiErrorMessage } from "@/api/client";

export default function ChangePasswordScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing details", "Please fill in all three fields.");
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert("Password too short", "Your new password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "New password and confirmation must match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      Alert.alert("Password Changed", "Your password has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Couldn't change password", apiErrorMessage(err, "Your current password may be incorrect."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Change Password" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryTint }]}>
            <Lock size={26} color={colors.primary} />
          </View>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            Choose a new password. You'll need your current password to confirm the change.
          </Text>

          <Card>
            <Field
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              colors={colors}
            />
            <Field label="New Password" value={newPassword} onChangeText={setNewPassword} colors={colors} />
            <Field
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              colors={colors}
              last
            />
          </Card>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  colors,
  last,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  last?: boolean;
}) {
  return (
    <View style={[styles.fieldWrap, !last && { marginBottom: 16 }]}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  iconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 24 },
  intro: { fontSize: 13, textAlign: "center", marginTop: 14, marginBottom: 20, paddingHorizontal: 10, lineHeight: 19 },
  fieldWrap: {},
  fieldLabel: { fontSize: 12, marginBottom: 6, fontWeight: "600" },
  fieldInput: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  saveButton: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 20 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
