import type { JSX } from "react";

import { Error } from "@/modules/error/Error";

/**
 * Error boundary fallback.
 */
export function ClientError({ error }: { error: Error }): JSX.Element {
	return <Error message={error.message} />;
}
