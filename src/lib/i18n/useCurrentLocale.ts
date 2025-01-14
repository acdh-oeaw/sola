import { useRouter } from "next/router";
import { useMemo } from "react";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { getCurrentLocale } from "@/lib/i18n/getCurrentLocale";

export function useCurrentLocale(): SiteLocale {
	const router = useRouter();
	const locale = useMemo(() => {
		return getCurrentLocale(router.locale);
	}, [router.locale]);
	return locale;
}
