import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { User, Mail, Phone } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";
import * as nursesApi from "@/api/nurses";
import { apiErrorMessage } from "@/api/client";

const WARDS = ["Medical Ward", "Surgical Ward", "ICU", "Emergency"];

export default function AddNurseScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState(WARDS[0]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing details", "Please enter at least a name and email.");
      return;
    }
    setLoading(true);
    try {
      const nurse = await nursesApi.createNurse({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, ward });
      Alert.alert("Nurse added", `${nurse.name} has been added to ${ward}. Default password is welcome1.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Add Nurse" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Card>
            <Field icon={User} label="Full Name" value={name} onChangeText={setName} colors={colors} placeholder="e.g. Jane Doe" />
            <Field icon={Mail} label="Email" value={email} onChangeText={setEmail} colors={colors} placeholder="jane.doe@hospital.com" keyboardType="email-address" />
            <Field icon={Phone} label="Phone" value={phone} onChangeText={setPhone} colors={colors} placeholder="+1 234 567 000" last />
          </Card>

          <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Assign Ward</Text>
          <View style={styles.chipRow}>
            {WARDS.map((w) => (
              <Pressable
                key={w}
                onPress={() => setWard(w)}
                style={[styles.chip, { backgroundColor: ward === w ? colors.primary : colors.surfaceAlt, borderColor: ward === w ? colors.primary : colors.border }]}
              >
                <Text style={{ color: ward === w ? "#fff" : colors.textSecondary, fontSize: 12, fontWeight: "700" }}>{w}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add Nurse</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({ icon: Icon, label, value, onChangeText, colors, placeholder, keyboardType, last }: any) {
  return (
    <View style={[styles.fieldWrap, !last && { marginBottom: 16 }]}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
        <Icon size={16} color={colors.textMuted} />
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType={keyboardType} style={[styles.fieldInput, { color: colors.text }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 16 },
  fieldWrap: {},
  fieldLabel: { fontSize: 12, marginBottom: 6, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  fieldInput: { flex: 1, fontSize: 14, height: "100%" },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  submitBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 26 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
