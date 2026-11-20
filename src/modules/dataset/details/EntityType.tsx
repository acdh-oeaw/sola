import cx from "clsx";

import type { SolaEntityType } from "@/api/sola/client";
import sola from "~/config/sola.json" with { type: "json" };

const { colors } = sola;

export function EntityType({ type }: { type?: SolaEntityType }) {
	if (type === undefined) return null;

	const classNames = cx(
		"text-xs font-medium tracking-wider uppercase pointer-events-none py-1 px-2 rounded-sm inline-block",
		colors.bg[type],
	);

	return <span className={classNames}>{type}</span>;
}
