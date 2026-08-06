# CareShift — Nurse Portal (Expo App)

A fully functional React Native app built with **Expo SDK 54**, **Expo Router**, and
**TypeScript**, recreating the CareShift Nurse Portal UI you shared — now as a real,
navigable mobile app for iOS, Android, and web.

## ✅ What's included

- **Two portals, one app** — a **Nurse Portal** and an **HR Manager Portal**, chosen with a
  role picker on the Login/Sign Up screen and persisted with the session
- **Authentication** — Login & Sign Up screens, session persisted with AsyncStorage
- **Bottom Tabs + Stack Navigation** — each portal has its own 5-tab bottom bar
  (Nurse: Dashboard, My Schedule, Leave, Availability, More · HR: Dashboard, Nurses,
  Schedule, Leave, More) plus a stack of secondary screens
- **Every screen is functional**: real state, forms that submit, a real interactive calendar,
  a save-able weekly availability grid, editable profile, working leave-request flow, and on
  the HR side — approve/reject leave requests, a searchable staff directory, a coverage grid,
  and report/schedule generation actions, all with local state
- **Dark Mode** — Light / Dark / System, toggled in Settings, persisted with AsyncStorage
- **Charts** — `react-native-chart-kit` bar/pie/line charts on both the Nurse Analytics screen
  and the HR Coverage Analytics screen
- **Calendar** — `react-native-calendars` used on My Schedule, Full Schedule, and Apply Leave
- **Lucide icons** throughout (`lucide-react-native`)
- **Placeholder avatars** via pravatar.cc with initials-fallback if no image loads
- **Responsive layout** — adapts padding/columns/max-width across phone, tablet, and web/desktop
  widths (see `src/hooks/useResponsive.ts`)
- **Smooth navigation animations** — native stack slide/fade transitions
- **Colors matched** to your reference screenshots (see `src/theme/colors.ts`)

## 📁 Project structure

```
app/
  _layout.tsx              Root layout: providers, stack, splash screen
  index.tsx                 Auth redirect (by portal: nurse vs hr)
  (auth)/
    login.tsx                Portal picker (Nurse / HR Manager) + sign in
    register.tsx
  (tabs)/                    NURSE bottom tabs
    _layout.tsx
    dashboard.tsx
    schedule.tsx
    leave.tsx
    availability.tsx
    more.tsx
  (hr)/                      HR bottom tabs
    _layout.tsx
    hr-dashboard.tsx
    hr-nurses.tsx
    hr-schedule.tsx
    hr-leave.tsx
    hr-more.tsx
  notifications.tsx          shared
  profile.tsx                shared (portal-aware)
  profile-edit.tsx           shared
  settings.tsx                shared
  help.tsx                    shared
  analytics.tsx                Nurse: My Analytics
  schedule/
    full.tsx
    [id].tsx
  leave/
    apply.tsx
    history.tsx
  availability/
    preferences.tsx
  hr/
    nurse/[id].tsx             HR: nurse profile
    leave/[id].tsx              HR: leave request detail (approve/reject)
    analytics.tsx                HR: Coverage Analytics
    reports.tsx                   HR: Reports
    generate-schedule.tsx          HR: Shift Requirements + auto-generate
    add-nurse.tsx                   HR: Add Nurse form
src/
  theme/          colors.ts, ThemeContext.tsx (light/dark)
  context/         AuthContext.tsx (role/portal-aware)
  components/      Card, Avatar, StatusBadge, ScreenHeader, ProgressRing
  data/            mockData.ts (seed data — nurse + HR, kept in sync)
  hooks/           useResponsive.ts
```

> **Route naming note:** Expo Router strips group folders like `(tabs)` and `(hr)` from the
> URL, so screens inside each group needed unique file names (`hr-dashboard.tsx` instead of
> `dashboard.tsx`) to avoid colliding with the Nurse tab's `dashboard.tsx`. Both resolve to
> clean tab bars — this only affects the underlying file names.

## 🚀 Running the app (Expo Go, SDK 54)

1. **Install dependencies**

   ```bash
   npm install
   ```

   The project ships with a `.npmrc` (`legacy-peer-deps=true`) so `npm install` won't
   hard-fail when a third-party RN library (e.g. an icon or chart package) hasn't yet
   published a peer-dependency range that lists React 19 — this is common right after a
   new React major ships and is safe to ignore here.

   After installing, run this once to auto-align every Expo-managed package to the exact
   patch version SDK 54 expects:

   ```bash
   npx expo install --fix
   ```

2. **Start the dev server**

   ```bash
   npx expo start
   ```

3. Scan the QR code with **Expo Go** (SDK 54 build) on your device, or press `i` / `a`
   for a simulator/emulator, or `w` for web.

## 🔐 Demo login

The app ships with a mock auth layer (no backend) — pick a portal on the login screen and
sign in with:

- **Email:** any value (pre-fills per portal — `sarah.johnson@hospital.com` for Nurse,
  `victoria.mensah@hospital.com` for HR Manager)
- **Password:** any 4+ characters

Or tap **Sign Up** to create a fresh session for either portal — either way your session
(including which portal) is written to AsyncStorage so you'll land back in the same portal
between app restarts.

## 🎨 Theming

All colors live in `src/theme/colors.ts`, sampled from the reference design (indigo/purple
primary, green/amber/pink accent tints). `ThemeProvider` exposes `useAppTheme()` with
`colors`, `isDark`, and `setPreference("light" | "dark" | "system")` — change it from the
**Settings** screen.

## 📊 Notes on data

All schedule, leave, and profile data is local mock data in `src/data/mockData.ts` so every
screen works fully offline out of the box. Swap these for real API calls whenever you're
ready to connect a backend — the screens already handle loading/empty/success states.

## 🧭 What's not in this pass

**Shift Requirements** as a standalone screen wasn't built separately — its functionality
(setting required staffing per ward/shift) lives inside **Generate Schedule**
(`app/hr/generate-schedule.tsx`), reachable from the HR More menu. Say the word if you'd
like it split into its own screen.
