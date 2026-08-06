import React from "react";
import { Tabs } from "expo-router";
import { LayoutGrid, CalendarDays, FileClock, CalendarCheck2, MoreHorizontal } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { Platform } from "react-native";

export default function TabsLayout() {
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
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "My Schedule",
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leave"
        options={{
          title: "Leave",
          tabBarIcon: ({ color, size }) => <FileClock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: "Availability",
          tabBarIcon: ({ color, size }) => <CalendarCheck2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
