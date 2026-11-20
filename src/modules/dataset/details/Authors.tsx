import type { QueryObserverResult } from "@tanstack/react-query";
import cx from "clsx";
import { useExtracted } from "next-intl";

import type { SolaListEntity } from "@/api/sola/client";
import type { SolaSelectedEntity } from "@/lib/sola/types";
import { Badge } from "@/modules/ui/Badge";
import { Spinner } from "@/modules/ui/Spinner";
import sola from "~/config/sola.json" with { type: "json" };

const { colors } = sola;

export function Authors({
	authors,
	setSelectedSolaEntity,
}: {
	authors: QueryObserverResult<Array<SolaListEntity>, unknown>;
	setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void;
}) {
	const t = useExtracted();

	if (authors.isLoading)
		return (
			<div className="py-1">
				<Spinner className="w-4 h-4 text-gray-700" />
			</div>
		);
	if (authors.data === undefined || authors.data.length === 0) return null;

	return (
		<dl className="pt-1 text-xs text-gray-700">
			<dt className="sr-only">
				{t("{count, plural, one {Author} other {Authors}}", { count: authors.data.length })}
			</dt>
			<dd className="flex items-center space-x-1">
				{authors.data.map((author) => {
					return (
						<Badge key={author.id} className={cx("transition", colors.bg.Person)}>
							<button
								className="font-medium cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900"
								onClick={() => {
									setSelectedSolaEntity({
										id: author.id,
										type: "Person",
									});
								}}
								type="button"
							>
								{author.name}
							</button>
						</Badge>
					);
				})}
			</dd>
		</dl>
	);
}
