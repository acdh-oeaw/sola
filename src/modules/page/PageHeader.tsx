"use client";

import { useExtracted, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type FocusEvent, type JSX, type KeyboardEvent, Suspense, useRef, useState } from "react";
import { Button, Disclosure, DisclosurePanel } from "react-aria-components";

import { Link, usePathname } from "@/i18n/navigation";
import { Menu as MenuIcon } from "@/modules/icons/Menu";

/**
 * Page header.
 */
export function PageHeader(): JSX.Element {
	const t = useExtracted();
	/** Pathname without locale prefix. */
	const pathname = usePathname();

	const links = [
		{ path: "/", label: t("Home") },
		{ path: "/dataset", label: t("Passages") },
		{ path: "/about", label: t("About the project") },
		{ path: "/team", label: t("Team") },
		{ path: "/posts", label: t("News") },
	];

	return (
		<header className="relative flex bg-white" style={{ gridArea: "header" }}>
			<nav
				className="grid flex-1"
				style={{ gridTemplateColumns: "var(--sidepanel-width, 240px) 1fr" }}
			>
				<Link
					href="/"
					aria-current={pathname === "/" ? "page" : undefined}
					className="z-20 flex items-center px-6 text-2xl font-extrabold tracking-wide text-white transition bg-yellow-400 hover:bg-yellow-500 focus:outline-hidden focus-visible:bg-yellow-500"
				>
					SOLA
				</Link>
				<div className="z-10 flex items-center justify-end px-6 space-x-4 shadow-sm xs:space-x-6">
					<ul className="hidden space-x-4 lg:flex lg:items-center">
						{links.map(({ path, label }) => {
							const isCurrent = pathname === path;
							return (
								<li key={path}>
									<Link
										href={path}
										aria-current={isCurrent ? "page" : undefined}
										className="inline-block px-2 py-2 text-sm font-medium text-center text-gray-700 transition border-b border-transparent hover:border-gray-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
									>
										{label}
									</Link>
								</li>
							);
						})}
					</ul>
					<MobileNav links={links} pathname={pathname} />
					<Suspense fallback={<LanguageToggleLink pathname={pathname} />}>
						<LanguageToggle pathname={pathname} />
					</Suspense>
				</div>
			</nav>
		</header>
	);
}

/**
 * Mobile navigation, following the WAI-ARIA APG disclosure navigation pattern.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
 */
function MobileNav({
	links,
	pathname,
}: {
	links: Array<{ path: string; label: string }>;
	pathname: string;
}) {
	const t = useExtracted();
	const [isExpanded, setExpanded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	/** Close after navigating to another page. */
	const [previousPathname, setPreviousPathname] = useState(pathname);
	if (pathname !== previousPathname) {
		setPreviousPathname(pathname);
		setExpanded(false);
	}

	/** Close on Escape and return focus to the toggle button. */
	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape" && isExpanded) {
			setExpanded(false);
			buttonRef.current?.focus();
		}
	}

	/** Close when focus moves outside the navigation. */
	function onBlur(event: FocusEvent) {
		if (!containerRef.current?.contains(event.relatedTarget)) {
			setExpanded(false);
		}
	}

	return (
		<div ref={containerRef} className="lg:hidden">
			<Disclosure isExpanded={isExpanded} onExpandedChange={setExpanded}>
				<Button
					ref={buttonRef}
					slot="trigger"
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					className="flex items-center justify-between px-4 py-2 space-x-1 transition rounded-sm outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-yellow-400 data-hovered:bg-gray-100 data-pressed:bg-gray-100 aria-expanded:bg-gray-100"
				>
					<MenuIcon />
					<span className="text-sm font-medium">{t("Menu")}</span>
				</Button>
				<DisclosurePanel
					aria-label={t("Navigation menu")}
					className="absolute inset-x-0 z-20 bg-white border-t border-gray-200 shadow-lg top-full"
				>
					<ul className="py-2">
						{links.map(({ path, label }) => {
							return (
								<li key={path}>
									<Link
										href={path}
										aria-current={pathname === path ? "page" : undefined}
										onKeyDown={onKeyDown}
										onBlur={onBlur}
										className="block px-6 py-3 text-base font-medium transition hover:bg-gray-100 focus:outline-hidden focus-visible:bg-gray-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400 aria-[current=page]:font-bold"
									>
										{label}
									</Link>
								</li>
							);
						})}
					</ul>
				</DisclosurePanel>
			</Disclosure>
		</div>
	);
}

/**
 * Links to the current page in the other locale, keeping search params (e.g. the selected entity
 * on the dataset page). The middleware remembers the choice in the `NEXT_LOCALE` cookie.
 */
function LanguageToggle({ pathname }: { pathname: string }) {
	const searchParams = useSearchParams();

	return <LanguageToggleLink pathname={pathname} query={Object.fromEntries(searchParams)} />;
}

function LanguageToggleLink({
	pathname,
	query,
}: {
	pathname: string;
	query?: Record<string, string>;
}) {
	const locale = useLocale();
	const otherLocale = locale === "de" ? "en" : "de";

	return (
		<Link
			href={{ pathname, query }}
			locale={otherLocale}
			className="p-2 text-sm font-medium transition bg-yellow-400 rounded-sm hover:bg-yellow-500 focus:outline-hidden focus-visible:bg-yellow-500"
		>
			{otherLocale.toUpperCase()}
		</Link>
	);
}
