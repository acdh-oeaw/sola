import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { useLabels } from "@/lib/i18n/LabelsContext";

/**
 * i18n.
 */
export const labels = {
	en: {
		page: {
			title: "Passages",
		},
		h1: "Passages",
		entityType: {
			Event: ["Event", "Events"],
			Institution: ["Institution", "Institutions"],
			Passage: ["Passage", "Passages"],
			Person: ["Person", "Persons"],
			Place: ["Place", "Places"],
			Publication: ["Work", "Works"],
		},
		options: "Options",
		other: "Other",
		filterPassages: "Filter passages",
		filteredBy: "Filtered by",
		reset: "Reset",
		selectEntityForDetails: "Please select an entity in the timeline above to view details.",
		authors: ["Author", "Authors"],
		properties: "Properties",
		search: "Search",
		title: "Title",
		topics: ["Topic", "Topics"],
		types: ["Type", "Types"],
		relations: "Relations",
		relationsTo: "Relations to",
		biblePassages: "Bible passages",
		primaryText: "Primary text",
		additionalTexts: "Additional texts",
		bibliography: "Bibliography",
		editedBy: "Edited by",
		copyLink: "Copy Link",
		printDocument: "Print Document",
	},
	de: {
		page: {
			title: "Passagen",
		},
		h1: "Passagen",
		entityType: {
			Event: ["Ereignis", "Ereignisse"],
			Institution: ["Institution", "Institutionen"],
			Passage: ["Passage", "Passagen"],
			Person: ["Person", "Personen"],
			Place: ["Ort", "Orte"],
			Publication: ["Werk", "Werke"],
		},
		options: "Optionen",
		other: "Andere",
		filterPassages: "Filter Passagen",
		filteredBy: "Gefiltert nach",
		reset: "Zurücksetzen",
		selectEntityForDetails: "Bitte Punkt in der Visualisierung auswählen, um Details zu sehen.",
		authors: ["AutorIn", "AutorInnen"],
		properties: "Eigenschaften",
		search: "Suchen",
		title: "Titel",
		topics: ["Thema", "Themen"],
		types: ["Gattung", "Gattungen"],
		relations: "Beziehungen",
		relationsTo: "Beziehungen mit",
		biblePassages: "Bibel-Passagen",
		primaryText: "Primärtext",
		additionalTexts: "Zusätzliche Texte",
		bibliography: "Bibliographie",
		editedBy: "Bearbeitet von",
		copyLink: "Link kopieren",
		printDocument: "Dokument drucken",
	},
} as const;

export type DatasetLabels = (typeof labels)[SiteLocale];

/**
 * Returns dataset page labels for the current locale.
 */
export function useDatasetLabels(): DatasetLabels {
	return useLabels() as DatasetLabels;
}
