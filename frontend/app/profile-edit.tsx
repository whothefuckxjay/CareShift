import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import { nurseProfile, hrProfile } from "@/data/mockData";

export default function ProfileEditScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();
  const base = user?.portal === "hr" ? hrProfile : nurseProfile;

  const [name, setName] = useState(user?.name ?? base.name);
  const [email, setEmail] = useState(user?.email ?? base.email);
  const [phone, setPhone] = useState(base.phone);
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Edit Profile" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <View style={styles.avatarWrap}>
            <Avatar uri={user?.avatar ?? base.avatar} name={name} size={92} />
            <Text style={[styles.changePhoto, { color: colors.primary }]}>Change Photo</Text>
          </View>

          <Card>
            <Field label="Full Name" value={name} onChangeText={setName} colors={colors} />
            <Field label="Email" value={email} onChangeText={setEmail} colors={colors} keyboardType="email-address" />
            <Field label="Phone" value={phone} onChangeText={setPhone} colors={colors} last />
          </Card>

          <Pressable onPress={onSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.saveButtonText}>{saved ? "Saved ✓" : "Save Changes"}</Text>
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
  keyboardType,
  last,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: any;
  keyboardType?: "email-address";
  last?: boolean;
}) {
  return (
    <View style={[styles.fieldWrap, !last && { marginBottom: 16 }]}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={[styles.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16 },
  avatarWrap: { alignItems: "center", marginTop: 24, marginBottom: 20 },
  changePhoto: { fontSize: 13, fontWeight: "700", marginTop: 10 },
  fieldWrap: {},
  fieldLabel: { fontSize: 12, marginBottom: 6, fontWeight: "600" },
  fieldInput: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  saveButton: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 20 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
