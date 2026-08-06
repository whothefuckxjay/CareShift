import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "@/api/auth";
import { TOKEN_KEY, apiErrorMessage } from "@/api/client";
import { ApiUser, Role } from "@/api/types";

export type Portal = "nurse" | "hr";

// The rest of the app (built before the backend existed) reads a slightly
// friendlier shape than the raw API user — this adapts one to the other.
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  portal: Portal;
};

const USER_KEY = "@careshift/user";

function toPortal(role: Role): Portal {
  return role === "HR" ? "hr" : "nurse";
}

function toUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role === "HR" ? "HR Manager" : "Staff Nurse",
    avatar: apiUser.avatar ?? `https://i.pravatar.cc/300?u=${encodeURIComponent(apiUser.email)}`,
    portal: toPortal(apiUser.role),
  };
}

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, portal: Portal) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, portal: Portal) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const cachedUser = await AsyncStorage.getItem(USER_KEY);
        if (token && cachedUser) {
          setUser(JSON.parse(cachedUser));
          // Refresh from the server in the background; if the token is stale
          // this will fail silently and the user stays on the cached session
          // until they hit an authenticated call that 401s.
          authApi
            .me()
            .then((apiUser) => persist(apiUser, token))
            .catch(() => {});
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (apiUser: ApiUser, token: string) => {
    const u = toUser(apiUser);
    setUser(u);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    try {
      const { token, user: apiUser } = await authApi.login(email.trim(), password);
      await persist(apiUser, token);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiErrorMessage(err, "Incorrect email or password.") };
    }
  };

  const signUp: AuthContextValue["signUp"] = async (name, email, password, portal) => {
    try {
      const role: Role = portal === "hr" ? "HR" : "NURSE";
      const { token, user: apiUser } = await authApi.register(name.trim(), email.trim(), password, role);
      await persist(apiUser, token);
      return { success: true };
    } catch (err) {
      return { success: false, error: apiErrorMessage(err, "Could not create your account.") };
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  const refreshUser = async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const apiUser = await authApi.me();
      await persist(apiUser, token);
    } catch {
      // ignore — keep whatever is cached
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
