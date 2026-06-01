import { RefItemsScreen } from "@/components/RefItemsScreen";
import { COMMANDS_PROHIBITIONS, CP_CATEGORIES } from "@/data/commandsProhibitions";
import { CHARACTER_TRAITS, CHAR_CATEGORIES } from "@/data/ethicalCharacterMap";
import { PARABLES, PARABLE_CATEGORIES } from "@/data/quranicParables";
import { WARNINGS, WARNING_CATEGORIES } from "@/data/quranicWarnings";

/** Thin wrappers configuring the shared RefItemsScreen for each reference page.
 *  Arabic + translation (+ tafsir) load verbatim from the backend. */

export function ParablesScreen() {
  return (
    <RefItemsScreen
      cfg={{ ns: "parables", items: PARABLES, categories: PARABLE_CATEGORIES, showTafsir: true, mainBadge: true }}
    />
  );
}

export function CommandsScreen() {
  return (
    <RefItemsScreen
      cfg={{
        ns: "commands",
        items: COMMANDS_PROHIBITIONS,
        categories: CP_CATEGORIES,
        typeBadge: true,
        showTafsir: true,
        typeFilter: {
          options: [
            { value: "command", labelKey: "more.command" },
            { value: "prohibition", labelKey: "more.prohibition" },
          ],
        },
      }}
    />
  );
}

export function WarningsScreen() {
  return (
    <RefItemsScreen
      cfg={{ ns: "warnings", items: WARNINGS, categories: WARNING_CATEGORIES, showTafsir: true }}
    />
  );
}

export function CharacterScreen() {
  return (
    <RefItemsScreen
      cfg={{
        ns: "character",
        items: CHARACTER_TRAITS,
        categories: CHAR_CATEGORIES,
        typeBadge: true,
        showTafsir: true,
        typeFilter: {
          options: [
            { value: "cultivate", labelKey: "more.cultivate" },
            { value: "avoid", labelKey: "more.avoid" },
          ],
        },
      }}
    />
  );
}
