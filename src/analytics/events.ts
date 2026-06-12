// Pure, dependency-free builders for xNotify event properties. Kept free of React
// Native / network imports so they unit-test in plain Node (`npm test`). Every
// helper here is deterministic — the side-effecting `track()` calls live at the
// call sites; these only shape the payloads.

/** Surah number from an "S:A" verse reference. "2:255" -> 2, "39:53" -> 39. */
export function surahNoFromRef(ref: string): number {
  const n = parseInt(ref, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Strip the UI "Surah " prefix so the event carries a bare surah name.
 *  "Surah Al-Baqarah" -> "Al-Baqarah"; anything else passes through trimmed. */
export function surahName(surah: string): string {
  return surah.trim().replace(/^surah\s+/i, "").trim();
}

/** Internal navigation screen (plus the open reference collection id, when on
 *  the refList screen) mapped to the xNotify `screen_name` taxonomy. Collection
 *  ids are normalised hyphen->underscore, so "names-of-allah" -> "names_of_allah"
 *  and "duas" -> "duas" without a hardcoded per-collection table. */
export function screenName(screen: string, collectionId?: string | null): string {
  switch (screen) {
    case "searchHome":
      return "home";
    case "results":
      return "search";
    case "reader":
      return "reader";
    case "recite":
      return "recite";
    case "facts":
      return "facts";
    case "library":
      return "library";
    case "passage":
      return "passage";
    case "about":
      return "about";
    case "saved":
      return "saved";
    case "settings":
      return "settings";
    case "refList":
      return collectionId ? collectionId.replace(/-/g, "_") : "collection";
    default:
      return screen;
  }
}

/** Which slice of an ayah a copy/share action carries. */
export type AyahTextType = "arabic" | "translation" | "both";

/** Build the clipboard/share text for an ayah. The reference (e.g. "2:255") is
 *  appended in parentheses; "both" stacks Arabic then translation. Missing parts
 *  are skipped so we never emit dangling separators. */
export function ayahText(
  parts: { arabic?: string; translation?: string; reference?: string },
  type: AyahTextType,
): string {
  const ref = parts.reference ? ` (${parts.reference})` : "";
  const arabic = (parts.arabic ?? "").trim();
  const translation = (parts.translation ?? "").trim();
  if (type === "arabic") return `${arabic}${ref}`.trim();
  if (type === "translation") return `${translation}${ref}`.trim();
  const body = [arabic, translation].filter(Boolean).join("\n\n");
  return `${body}${ref}`.trim();
}
