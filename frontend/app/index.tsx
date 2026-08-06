import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeContext";

export default function Index() {
  const { user, isLoading } = useAuth();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dest = !user ? "/(auth)/login" : user.portal === "hr" ? "/(hr)/hr-dashboard" : "/(tabs)/dashboard";
  return <Redirect href={dest} />;
}
