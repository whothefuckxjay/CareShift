import React from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

export function LoadingBox() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.center, styles.errorBox, { backgroundColor: colors.dangerTint, borderColor: colors.danger }]}>
      <Text style={[styles.errorText, { color: colors.danger }]}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={[styles.retryBtn, { borderColor: colors.danger }]}>
          <Text style={[styles.retryText, { color: colors.danger }]}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  errorBox: { borderRadius: 14, borderWidth: 1, margin: 16 },
  errorText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  retryBtn: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  retryText: { fontSize: 12, fontWeight: "700" },
});
