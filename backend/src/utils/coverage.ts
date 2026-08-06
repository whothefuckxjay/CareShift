// Required headcount per ward per shift type. This mirrors the "Shift
// Requirements" numbers from the app design. There's no admin UI to edit
// these yet (that's the deferred "Shift Requirements" screen) — for now
// they're fixed server-side constants.
export const WARD_REQUIREMENTS: Record<string, { MORNING: number; EVENING: number; NIGHT: number }> = {
  "Medical Ward": { MORNING: 30, EVENING: 25, NIGHT: 20 },
  "Surgical Ward": { MORNING: 25, EVENING: 25, NIGHT: 18 },
  ICU: { MORNING: 20, EVENING: 20, NIGHT: 20 },
  Emergency: { MORNING: 22, EVENING: 22, NIGHT: 15 },
};

export const ALL_WARDS = Object.keys(WARD_REQUIREMENTS);

export function requiredFor(ward: string, type: "MORNING" | "EVENING" | "NIGHT"): number {
  return WARD_REQUIREMENTS[ward]?.[type] ?? 10;
}

export function totalRequired(type: "MORNING" | "EVENING" | "NIGHT"): number {
  return ALL_WARDS.reduce((sum, w) => sum + requiredFor(w, type), 0);
}
