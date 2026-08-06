import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

export default function Avatar({
  uri,
  name,
  size = 44,
}: {
  uri?: string;
  name: string;
  size?: number;
}) {
  const { colors } = useAppTheme();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryTint,
        },
      ]}
    >
      <Text style={{ color: colors.primary, fontWeight: "700", fontSize: size / 2.6 }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
