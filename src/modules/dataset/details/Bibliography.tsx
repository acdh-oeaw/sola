import { useMemo } from "react";

import type { SolaBibsonomyReference } from "@/api/sola/client";

export function Bibliography({ bibliography }: { bibliography: Array<SolaBibsonomyReference> }) {
	const sorted = useMemo(() => {
		return bibliography.sort((a, b) => {
			if (a.author == null) return -1;
			if (b.author == null) return 1;
			return a.author.localeCompare(b.author);
		});
	}, [bibliography]);

	return (
		<ul className="space-y-2">
			{sorted.map((reference) => {
				return (
					<li key={reference.pk} className="leading-6">
						<BibliographicReference reference={reference} />
					</li>
				);
			})}
		</ul>
	);
}

export function BibliographicReference({ reference }: { reference: SolaBibsonomyReference }) {
	const entry = useMemo(() => {
		const text = [];

		if (reference.author) text.push(`${reference.author}:`);
		if (reference.title) text.push(`${reference.title}.`);
		if (reference.address) text.push(`${reference.address}:`);
		if (reference.publisher) text.push(reference.publisher);
		if (reference.year) {
			if (reference.pages_start) {
				text.push(`${reference.year},`);
				const pages = [];
				if (reference.pages_start) pages.push(reference.pages_start);
				if (reference.pages_end) pages.push(reference.pages_end);
				text.push(pages.join("-"));
			} else {
				text.push(reference.year);
			}
		}

		return `${text.join(" ")}.`;
	}, [reference]);

	return <div>{entry}</div>;
}
