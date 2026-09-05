// Pure, dependency-free parser for the Google Play Install Referrer string.
// Kept separate from attribution.ts (which pulls in react-native) so it can be
// unit-tested under plain `node --test`.

/**
 * Extract the volunteer code from a Play referrer query string.
 * Accepts the bare param (`utm_volunteer=ABC`) or a full query
 * (`utm_source=x&utm_volunteer=ABC&utm_medium=y`). Returns null when absent.
 */
export function parseVolunteerCode(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  for (const part of referrer.split("&")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq);
    const val = part.slice(eq + 1);
    if (key === "utm_volunteer" && val) {
      try { return decodeURIComponent(val); } catch { return val; }
    }
  }
  return null;
}
