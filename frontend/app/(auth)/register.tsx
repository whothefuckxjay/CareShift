import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { User, Mail, Lock, ArrowLeft, Stethoscope, Users } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth, Portal } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const [portal, setPortal] = useState<Portal>("nurse");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const res = await signUp(name.trim(), email.trim(), password, portal);
    setLoading(false);
    if (!res.success) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    router.replace(portal === "hr" ? "/(hr)/hr-dashboard" : "/(tabs)/dashboard");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <Text style={[styles.welcome, { color: colors.text }]}>Create account</Text>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          Join CareShift to manage your nursing schedule.
        </Text>

        <View style={[styles.portalRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <PortalOption icon={Stethoscope} label="Nurse" active={portal === "nurse"} onPress={() => setPortal("nurse")} />
          <PortalOption icon={Users} label="HR Manager" active={portal === "hr"} onPress={() => setPortal("hr")} />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <User size={18} color={colors.textMuted} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Mail size={18} color={colors.textMuted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Lock size={18} color={colors.textMuted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PortalOption({
  icon: Icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={[styles.portalOption, active && { backgroundColor: colors.primary }]}>
      <Icon size={16} color={active ? "#fff" : colors.textSecondary} />
      <Text style={[styles.portalOptionText, { color: active ? "#fff" : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  backBtn: { marginBottom: 18 },
  welcome: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  helper: { fontSize: 14, marginBottom: 20 },
  portalRow: { flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 18, gap: 4 },
  portalOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  portalOptionText: { fontSize: 12.5, fontWeight: "700" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 15, height: "100%" },
  error: { fontSize: 13, marginBottom: 10 },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
});
