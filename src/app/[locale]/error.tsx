"use client";

import type { JSX } from "react";

import { Error } from "@/modules/error/Error";

/**
 * Error boundary for pages.
 */
export default function ErrorPage({ error }: { error: Error }): JSX.Element {
	return (
		<main className="flex flex-col items-center justify-center">
			<Error message={error.message} />
		</main>
	);
}
