import { useExtracted } from "next-intl";

import type { SolaEntityType } from "@/api/sola/client";

/**
 * Singular and plural labels for entity types.
 */
export function useEntityTypeLabels(): Record<SolaEntityType, readonly [string, string]> {
	const t = useExtracted();

	return {
		Event: [t("Event"), t("Events")],
		Institution: [t("Institution"), t("Institutions")],
		Passage: [t("Passage"), t("Passages")],
		Person: [t("Person"), t("Persons")],
		Place: [t("Place"), t("Places")],
		Publication: [t("Work"), t("Works")],
	};
}
