import React from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

export function LoadingView() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.center}>
      <Text style={[styles.errorText, { color: colors.danger }]}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.center}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
