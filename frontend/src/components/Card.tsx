import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";

export default function Card({ style, children, ...rest }: ViewProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.shadow, borderColor: colors.border },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
});
