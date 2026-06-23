import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale, UserPreferences, License, UserProfile } from "@/types";

interface AppState {
  // Auth
  user: UserProfile | null;
  license: License | null;
  preferences: UserPreferences | null;

  // UI
  locale: Locale;
  sidebarOpen: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setLicense: (license: License | null) => void;
  setPreferences: (prefs: UserPreferences | null) => void;
  setLocale: (locale: Locale) => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      license: null,
      preferences: null,
      locale: "es",
      sidebarOpen: false,

      setUser: (user) => set({ user }),
      setLicense: (license) => set({ license }),
      setPreferences: (preferences) => set({ preferences }),
      setLocale: (locale) => set({ locale }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      reset: () => set({ user: null, license: null, preferences: null }),
    }),
    {
      name: "diy-calc-store",
      partialize: (state) => ({
        locale: state.locale,
      }),
    }
  )
);

export const isPremium = (license: License | null): boolean =>
  license?.status === "active" && (license.plan === "premium" || license.plan === "admin");

export const isAdmin = (user: UserProfile | null): boolean =>
  user?.role === "admin";
