import { useExtracted } from "next-intl";

import type { SolaEntityDetails } from "@/api/sola/client";
import { useSolaUsers } from "@/lib/sola/hooks";

export function EditedBy({ editorId }: { editorId?: SolaEntityDetails["assigned_user"] }) {
	const t = useExtracted();

	const users = useSolaUsers();
	const userId = editorId?.label;
	const editor = userId !== undefined ? users.data?.[userId] : undefined;

	if (editor == null) return null;

	return (
		<div className="space-y-1">
			<h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
				{t("Edited by")}
			</h3>
			<div className="text-sm text-gray-700">{[editor.first_name, editor.last_name].join(" ")}</div>
		</div>
	);
}
