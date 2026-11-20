import { useExtracted } from "next-intl";
import type { JSX } from "react";

import { Clear } from "../icons/Clear";

export interface ClearButtonProps {
	"aria-label"?: string;
	className?: string;
	onClick: () => void;
}

export function ClearButton(props: ClearButtonProps): JSX.Element {
	const t = useExtracted();

	return (
		<button aria-label={t("Clear")} type="button" {...props}>
			<Clear />
		</button>
	);
}
