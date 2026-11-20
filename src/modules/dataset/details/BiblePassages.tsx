import type { QueryObserverResult } from "@tanstack/react-query";
import { useExtracted } from "next-intl";

import { count } from "@/lib/util/count";
import { Badge } from "@/modules/ui/Badge";

export function BiblePassages({
	passages,
}: {
	passages: QueryObserverResult<Record<string, string>, unknown>;
}) {
	const t = useExtracted();

	if (passages.isLoading) return <span>{t("Loading…")}</span>;
	if (passages.data === undefined || count(passages.data) === 0) return null;

	return (
		<div className="space-y-1">
			<h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
				{t("Bible passages")}
			</h3>
			<ul className="flex flex-wrap items-center text-xs">
				{Object.entries(passages.data).map(([reference, url]) => {
					return (
						<li className="min-w-0 mb-1 mr-1" key={reference}>
							<Badge
								variant="tight"
								className="inline-block max-w-full font-medium transition bg-blue-300"
							>
								<a
									className="rounded-sm px-2 py-0.5 inline-block font-medium truncate cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900"
									href={url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{reference}
								</a>
							</Badge>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
