import type { Locale } from "next-intl";

const dateFormatter = {
	en: Intl.DateTimeFormat("en"),
	de: Intl.DateTimeFormat("de"),
};

export function formatDate(date: Date | number | string, locale: Locale): string {
	return dateFormatter[locale].format(typeof date === "string" ? new Date(date) : date);
}
