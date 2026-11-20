import { useDatasetLabels } from "@/modules/dataset/labels";
import { Link as LinkIcon } from "@/modules/icons/Link";
import site from "~/config/site.json" with { type: "json" };

const { url: baseUrl } = site;

export function CopyLinkButton() {
	const t = useDatasetLabels();

	return (
		<button
			className="inline-flex items-center px-2 py-1 space-x-1 text-xs font-medium text-gray-700 transition bg-gray-200 rounded-sm hover:bg-gray-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900"
			onClick={() => {
				const url = new URL(window.location.pathname + window.location.search, baseUrl);
				void navigator.clipboard.writeText(String(url));
			}}
			type="button"
		>
			<LinkIcon />
			<span>{t.copyLink}</span>
		</button>
	);
}
