"use client";

import { useParams } from "next/navigation";

import { type SiteLocale, getCurrentLocale } from "@/lib/i18n/getCurrentLocale";

export function useCurrentLocale(): SiteLocale {
	const params = useParams<{ locale?: string }>();
	return getCurrentLocale(params.locale);
}
