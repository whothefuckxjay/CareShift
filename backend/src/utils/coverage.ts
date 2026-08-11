// Required headcount per ward per shift type. This mirrors the "Shift
// Requirements" numbers from the app design. There's no admin UI to edit
// these yet (that's the deferred "Shift Requirements" screen) — for now
// they're fixed server-side constants.
export const WARD_REQUIREMENTS: Record<string, { MORNING: number; EVENING: number; NIGHT: number }> = {
  "Medical Ward": { MORNING: 10, EVENING: 8, NIGHT: 7 },
  "Surgical Ward": { MORNING: 8, EVENING: 8, NIGHT: 6 },
  ICU: { MORNING: 7, EVENING: 7, NIGHT: 7 },
  Emergency: { MORNING: 7, EVENING: 7, NIGHT: 5 },
};

export const ALL_WARDS = Object.keys(WARD_REQUIREMENTS);

export function requiredFor(ward: string, type: "MORNING" | "EVENING" | "NIGHT"): number {
  return WARD_REQUIREMENTS[ward]?.[type] ?? 10;
}

export function totalRequired(type: "MORNING" | "EVENING" | "NIGHT"): number {
  return ALL_WARDS.reduce((sum, w) => sum + requiredFor(w, type), 0);
}
