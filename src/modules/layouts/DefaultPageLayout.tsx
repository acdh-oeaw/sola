import type { JSX, ReactNode } from "react";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { PageFooter } from "@/modules/page/PageFooter";
import { PageHeader } from "@/modules/page/PageHeader";

export interface DefaultPageLayoutProps {
	children: ReactNode;
	locale: SiteLocale;
}

/**
 * Default page layout.
 */
export function DefaultPageLayout(props: DefaultPageLayoutProps): JSX.Element {
	return (
		<div
			className="grid min-h-screen"
			style={{
				gridTemplateRows:
					"var(--header-height, 60px) minmax(calc(100vh - var(--header-height, 60px)), 1fr) auto",
				gridTemplateAreas: '"header" "main" "footer"',
			}}
		>
			<PageHeader locale={props.locale} />
			{props.children}
			<PageFooter locale={props.locale} />
		</div>
	);
}
