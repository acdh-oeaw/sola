import { Fragment } from "react";

export function Duration({
	from,
	fromIso,
	to,
	toIso,
}: {
	from?: string | null;
	fromIso?: string | null;
	to?: string | null;
	toIso?: string | null;
}) {
	if (from == null && to == null) return null;

	const start = from != null && fromIso != null ? <time dateTime={fromIso}>{from}</time> : null;
	const end = to != null && toIso != null ? <time dateTime={toIso}>{to}</time> : null;

	return (
		<div className="text-sm text-gray-700">
			{start}
			{toIso !== fromIso ? (
				<Fragment>
					<span> &ndash; </span>
					{end}
				</Fragment>
			) : null}
		</div>
	);
}
