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
import { HeartPulse, Mail, Lock, Eye, EyeOff, Stethoscope, Users } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useAuth, Portal } from "@/context/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const router = useRouter();
  const { contentMaxWidth } = useResponsive();

  const [portal, setPortal] = useState<Portal>("nurse");
  const [email, setEmail] = useState("sarah.johnson@hospital.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSelectPortal = (p: Portal) => {
    setPortal(p);
    setEmail(p === "hr" ? "victoria.mensah@hospital.com" : "sarah.johnson@hospital.com");
  };

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    const res = await signIn(email.trim(), password, portal);
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
        <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
          <HeartPulse size={30} color="#fff" />
        </View>
        <Text style={[styles.brand, { color: colors.text }]}>CareShift</Text>
        <Text style={[styles.subBrand, { color: colors.textSecondary }]}>
          {portal === "hr" ? "HR Manager Portal" : "Nurse Portal"}
        </Text>

        <Text style={[styles.welcome, { color: colors.text }]}>Welcome back 👋</Text>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          {portal === "hr"
            ? "Sign in to manage staff, schedules and leave approvals."
            : "Sign in to view your schedule, leave and availability."}
        </Text>

        <View style={[styles.portalRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <PortalOption
            icon={Stethoscope}
            label="Nurse"
            active={portal === "nurse"}
            onPress={() => onSelectPortal("nurse")}
          />
          <PortalOption
            icon={Users}
            label="HR Manager"
            active={portal === "hr"}
            onPress={() => onSelectPortal("hr")}
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
            secureTextEntry={!showPassword}
            style={[styles.input, { color: colors.text }]}
          />
          <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
            {showPassword ? (
              <EyeOff size={18} color={colors.textMuted} />
            ) : (
              <Eye size={18} color={colors.textMuted} />
            )}
          </Pressable>
        </View>

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </Pressable>


        <View style={styles.footerRow}>
          <Text style={{ color: colors.textSecondary }}>Don&apos;t have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign Up</Text>
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
    <Pressable
      onPress={onPress}
      style={[styles.portalOption, active && { backgroundColor: colors.primary }]}
    >
      <Icon size={16} color={active ? "#fff" : colors.textSecondary} />
      <Text style={[styles.portalOptionText, { color: active ? "#fff" : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  brand: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  subBrand: { fontSize: 14, textAlign: "center", marginBottom: 28 },
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
  hint: { fontSize: 12, textAlign: "center", marginTop: 12 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
});
