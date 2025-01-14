import { Fragment } from "react";

import { Error } from "@/modules/error/Error";
import { Metadata } from "@/modules/metadata/Metadata";

/**
 * Not found page.
 */
export default function NotFoundPage(): JSX.Element {
	return (
		<Fragment>
			<Metadata noindex nofollow title="Page not found" />
			<main className="flex flex-col items-center justify-center">
				<Error message="Page not found." statusCode={404} />
			</main>
		</Fragment>
	);
}
