import { PageFooter } from "@/modules/page/PageFooter";
import { PageHeader } from "@/modules/page/PageHeader";

export interface DefaultPageLayoutProps {
	children: JSX.Element;
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
			<PageHeader />
			{props.children}
			<PageFooter />
		</div>
	);
}
