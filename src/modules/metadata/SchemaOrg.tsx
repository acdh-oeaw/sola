import Head from "next/head";
import type { JSX } from "react";

interface EntitySchema {
	"@type": "Event" | "Organization" | "CreativeWork" | "Person" | "Place";
	name: string;
}

export function createSchemaOrg(schema: EntitySchema): EntitySchema {
	return schema;
}

export function SchemaOrg({ schema }: { schema: EntitySchema }): JSX.Element {
	const json = JSON.stringify({ "@context": "https://schema.org", ...schema }).replace(
		/</g,
		"\\u003c",
	);
	return (
		<Head>
			<script
				dangerouslySetInnerHTML={{ __html: json }}
				key="schema-org"
				type="application/ld+json"
			/>
		</Head>
	);
}
