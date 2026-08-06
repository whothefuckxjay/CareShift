// Colors sampled directly from the CareShift reference design.
export const palette = {
  purple: "#6D5DF4",
  purpleDark: "#5A4AE3",
  purpleTint: "#EDE9FE",
  purpleTintDark: "#2C2650",

  green: "#1FA971",
  greenTint: "#E1F5EA",
  greenTintDark: "#153A2A",

  amber: "#E6A93B",
  amberTint: "#FBF1DC",
  amberTintDark: "#3D3220",

  pink: "#E24C6D",
  pinkTint: "#FBE7EC",
  pinkTintDark: "#3D2028",

  blue: "#3B82F6",
  blueTint: "#E4EDFD",

  white: "#FFFFFF",
  black: "#000000",
};

export type ThemeColors = typeof lightColors;

export const lightColors = {
  mode: "light" as const,
  background: "#F6F5FA",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAFC",
  border: "#EEEDF4",
  text: "#1F2136",
  textSecondary: "#6B7080",
  textMuted: "#9A9DAE",
  primary: palette.purple,
  primaryDark: palette.purpleDark,
  primaryTint: palette.purpleTint,
  success: palette.green,
  successTint: palette.greenTint,
  warning: palette.amber,
  warningTint: palette.amberTint,
  danger: palette.pink,
  dangerTint: palette.pinkTint,
  info: palette.blue,
  infoTint: palette.blueTint,
  tabBarBackground: "#FFFFFF",
  tabBarInactive: "#9A9DAE",
  shadow: "rgba(31, 33, 54, 0.06)",
  statusBar: "dark" as const,
};

export const darkColors: ThemeColors = {
  mode: "dark" as const,
  background: "#121319",
  surface: "#1B1D26",
  surfaceAlt: "#20222C",
  border: "#2B2E3B",
  text: "#F2F2F6",
  textSecondary: "#A7AAB8",
  textMuted: "#7B7E8C",
  primary: "#8577F7",
  primaryDark: palette.purple,
  primaryTint: palette.purpleTintDark,
  success: "#3FCB8E",
  successTint: palette.greenTintDark,
  warning: "#F0BE63",
  warningTint: palette.amberTintDark,
  danger: "#EE7590",
  dangerTint: palette.pinkTintDark,
  info: "#6DA1F8",
  infoTint: "#1D2B45",
  tabBarBackground: "#1B1D26",
  tabBarInactive: "#6C6F7D",
  shadow: "rgba(0, 0, 0, 0.35)",
  statusBar: "light" as const,
};
