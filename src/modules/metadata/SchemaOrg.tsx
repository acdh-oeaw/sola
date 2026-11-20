import type { JSX } from "react";

interface EntitySchema {
	"@type": "Event" | "Organization" | "CreativeWork" | "Person" | "Place";
	name: string;
}

export function createSchemaOrg(schema: EntitySchema): EntitySchema {
	return schema;
}

/**
 * JSON-LD structured data. Valid anywhere in the document, so it does not need to be in `<head>`.
 */
export function SchemaOrg({ schema }: { schema: EntitySchema }): JSX.Element {
	const json = JSON.stringify({ "@context": "https://schema.org", ...schema }).replace(
		/</g,
		"\\u003c",
	);
	return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}
