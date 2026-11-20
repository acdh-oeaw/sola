import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

/**
 * Locale routing: URLs without locale prefix redirect to the matching locale, detected from the
 * `NEXT_LOCALE` cookie or the `Accept-Language` header.
 */
export default createMiddleware(routing);

export const config = {
	/** Skip Next.js internals and files with an extension (`/sitemap.xml`, `/assets/...`). */
	matcher: ["/((?!_next/|.*\\.).*)"],
};
