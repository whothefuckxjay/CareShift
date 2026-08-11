import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useAppTheme } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { MessagesProvider } from "@/context/MessagesContext";
import Toast from "@/components/Toast";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(hr)" />
        <Stack.Screen name="notifications" options={{ presentation: "card" }} />
        <Stack.Screen name="messages" options={{ presentation: "card" }} />
        <Stack.Screen name="messages/[id]" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="profile-edit" />
        <Stack.Screen name="help" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="schedule/full" />
        <Stack.Screen name="schedule/[id]" />
        <Stack.Screen name="leave/apply" />
        <Stack.Screen name="leave/history" />
        <Stack.Screen name="availability/preferences" />
        <Stack.Screen name="hr/nurse/[id]" />
        <Stack.Screen name="hr/leave/[id]" />
        <Stack.Screen name="hr/analytics" />
        <Stack.Screen name="hr/reports" />
        <Stack.Screen name="hr/generate-schedule" />
        <Stack.Screen name="hr/add-nurse" />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <MessagesProvider>
              <RootStack />
            </MessagesProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
