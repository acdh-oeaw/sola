import Link from "next/link";
import { useRouter } from "next/router";
import { type FocusEvent, type JSX, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button, Disclosure, DisclosurePanel } from "react-aria-components";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { useCurrentLocale } from "@/lib/i18n/useCurrentLocale";
import { Menu as MenuIcon } from "@/modules/icons/Menu";
import navigation from "~/config/navigation.json" with { type: "json" };

const labels = {
	en: {
		menu: "Menu",
		navigationMenu: "Navigation menu",
	},
	de: {
		menu: "Menü",
		navigationMenu: "Navigationsmenü",
	},
};

/**
 * Page header.
 */
export function PageHeader(): JSX.Element {
	const router = useRouter();
	const locale = useCurrentLocale();

	const links = (navigation as Record<SiteLocale, Array<{ path: string; label: string }>>)[locale];

	return (
		<header className="relative flex bg-white" style={{ gridArea: "header" }}>
			<nav
				className="grid flex-1"
				style={{ gridTemplateColumns: "var(--sidepanel-width, 240px) 1fr" }}
			>
				<Link
					href="/"
					aria-current={router.pathname === "/" ? "page" : undefined}
					className="z-20 flex items-center px-6 text-2xl font-extrabold tracking-wide text-white transition bg-yellow-400 hover:bg-yellow-500 focus:outline-hidden focus-visible:bg-yellow-500"
				>
					SOLA
				</Link>
				<div className="z-10 flex items-center justify-end px-6 space-x-4 shadow-sm xs:space-x-6">
					<ul className="hidden space-x-4 lg:flex lg:items-center">
						{links.map(({ path, label }) => {
							const isCurrent = router.pathname === path;
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
					<MobileNav links={links} t={labels[locale]} />
					<LanguageToggle />
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
	t,
}: {
	links: Array<{ path: string; label: string }>;
	t: (typeof labels)[SiteLocale];
}) {
	const router = useRouter();
	const [isExpanded, setExpanded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		function close() {
			setExpanded(false);
		}

		router.events.on("routeChangeStart", close);

		return () => {
			router.events.off("routeChangeStart", close);
		};
	}, [router.events]);

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
					<span className="text-sm font-medium">{t.menu}</span>
				</Button>
				<DisclosurePanel
					aria-label={t.navigationMenu}
					className="absolute inset-x-0 z-20 bg-white border-t border-gray-200 shadow-lg top-full"
				>
					<ul className="py-2">
						{links.map(({ path, label }) => {
							return (
								<li key={path}>
									<Link
										href={path}
										aria-current={router.pathname === path ? "page" : undefined}
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

function LanguageToggle() {
	const router = useRouter();
	const locale = useCurrentLocale();

	const otherLocale = locale === "de" ? "en" : "de";

	return (
		<Link
			href={router.asPath}
			locale={otherLocale}
			className="p-2 text-sm font-medium transition bg-yellow-400 rounded-sm hover:bg-yellow-500 focus:outline-hidden focus-visible:bg-yellow-500"
		>
			{otherLocale.toUpperCase()}
		</Link>
	);
}
