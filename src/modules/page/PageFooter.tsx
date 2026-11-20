import type { Locale } from "next-intl";
import { getExtracted } from "next-intl/server";
import type { JSX } from "react";

import { Link } from "@/i18n/navigation";

/**
 * Page footer.
 */
export async function PageFooter({ locale }: { locale: Locale }): Promise<JSX.Element> {
	const t = await getExtracted({ locale });
	return (
		<footer
			className="px-6 py-6 space-y-4 bg-white border-t border-gray-200 2xl:space-y-12 2xl:py-12"
			style={{ gridArea: "footer" }}
		>
			<ul className="flex flex-col items-center justify-center space-y-4 text-xs text-gray-700 sm:flex-row sm:space-y-0 sm:space-x-12">
				<li>
					<a
						className="inline-block p-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
						href="https://www.univie.ac.at"
						rel="noopener noreferrer"
						target="_blank"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className="h-8 2xl:h-10"
							src="/assets/images/uni-vienna-logo.svg"
							alt={t("University of Vienna")}
							loading="lazy"
						/>
					</a>
				</li>
				<li>
					<a
						className="inline-block p-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
						href="https://www.fwf.ac.at"
						rel="noopener noreferrer"
						target="_blank"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className="h-8 2xl:h-10"
							src="/assets/images/fwf-logo.svg"
							alt={t("Austrian Science Fund")}
							loading="lazy"
						/>
					</a>
				</li>
				<li>
					<a
						className="inline-block p-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
						href="https://acdh.oeaw.ac.at"
						rel="noopener noreferrer"
						target="_blank"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className="h-8 2xl:h-10"
							src="/assets/images/acdh-logo.svg"
							alt={t("Austrian Centre for Digital Humanities and Cultural Heritage")}
							loading="lazy"
						/>
					</a>
				</li>
			</ul>
			<div className="text-xs text-center text-gray-500">
				<span>&copy; {new Date().getFullYear()} | </span>
				<Link
					href="/imprint"
					locale={locale}
					className="p-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
				>
					{t("Imprint")}
				</Link>
			</div>
		</footer>
	);
}
