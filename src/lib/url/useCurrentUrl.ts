import type { LinkProps } from "next/link";
import type { NextRouter } from "next/router";
import { useRouter } from "next/router";

import { createUrlFromPath } from "@/lib/url/createUrlFromPath";
import { removeTrailingSlash } from "@/lib/url/removeTrailingSlash";

export interface IsCurrentUrlProps {
	current: {
		route: NextRouter["route"];
		href: NextRouter["asPath"];
	};
	href: LinkProps["href"];
}

export interface UseCurrentUrlProps {
	href: LinkProps["href"];
	isCurrentUrl?: (props: IsCurrentUrlProps) => boolean;
}

/**
 * Returns whether the provided href matches the current route.
 *
 * By default, pathnames are matched exactly, and query params are ignored.
 */
export function useCurrentUrl(props: UseCurrentUrlProps): boolean {
	const { isCurrentUrl = isMatchingPathname } = props;
	const router = useRouter();

	const isCurrent = isCurrentUrl({
		current: {
			route: router.route,
			href: router.asPath,
		},
		href: props.href,
	});

	return isCurrent;
}

function isMatchingPathname({ current, href }: IsCurrentUrlProps): boolean {
	const { pathname } = typeof href === "string" ? createUrlFromPath(href) : href;
	if (pathname == null) return false;
	const { pathname: currentPathname } = createUrlFromPath(current.href);
	return removeTrailingSlash(pathname) === removeTrailingSlash(currentPathname);
}
