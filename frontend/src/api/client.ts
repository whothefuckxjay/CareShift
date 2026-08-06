import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Point this at your running backend (see /backend/README.md).
//
// - iOS simulator / web:            http://localhost:4000/api
// - Android emulator:                http://10.0.2.2:4000/api
// - Physical device (Expo Go):        http://<your-computer's-LAN-IP>:4000/api
//
// Easiest override: set EXPO_PUBLIC_API_URL before starting the app, e.g.
//   EXPO_PUBLIC_API_URL=http://192.168.1.23:4000/api npx expo start
const DEFAULT_URL =
  "http://172.20.10.6:4000/api";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL;

export const TOKEN_KEY = "@careshift/token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string } | undefined)?.error;
    if (msg) return msg;
    if (err.code === "ECONNABORTED" || !err.response) {
      return "Couldn't reach the server. Check that the backend is running and reachable.";
    }
  }
  return fallback;
}
