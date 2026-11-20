import { createNavigation } from "next-intl/navigation";

import { routing } from "@/i18n/routing";

/** Wrappers around Next.js navigation APIs which add the locale prefix. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
