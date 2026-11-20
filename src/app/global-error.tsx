"use client";

import type { JSX } from "react";

import { Error } from "@/modules/error/Error";

/**
 * Error boundary for errors in the root layout.
 */
export default function GlobalErrorPage(): JSX.Element {
	return (
		<html lang="en">
			<body>
				<main>
					<title>Unexpected error</title>
					<Error message="An unexpected error has occurred." statusCode={500} />
				</main>
			</body>
		</html>
	);
}
