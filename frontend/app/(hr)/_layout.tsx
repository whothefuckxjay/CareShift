import React from "react";
import { Tabs } from "expo-router";
import { LayoutGrid, Users, CalendarRange, FileClock, MoreHorizontal } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { Platform } from "react-native";
import { hrStats } from "@/data/mockData";

export default function HRTabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 88 : 66,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="hr-dashboard"
        options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="hr-nurses"
        options={{ title: "Nurses", tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="hr-schedule"
        options={{ title: "Schedule", tabBarIcon: ({ color, size }) => <CalendarRange color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="hr-leave"
        options={{
          title: "Leave",
          tabBarIcon: ({ color, size }) => <FileClock color={color} size={size} />,
          tabBarBadge: hrStats.pendingLeaves > 0 ? hrStats.pendingLeaves : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="hr-more"
        options={{ title: "More", tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} /> }}
      />
    </Tabs>
  );
}
