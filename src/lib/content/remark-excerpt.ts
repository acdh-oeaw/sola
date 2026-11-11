import type { Root, RootContent } from "mdast";
import type { Plugin } from "unified";

interface ExcerptOptions {
	maxLength: number;
}

/** Keep content before an excerpt marker, otherwise truncate the text nodes. */
export const excerptMarkdown: Plugin<[ExcerptOptions], Root> = ({ maxLength }) => {
	return (tree) => {
		const marker = tree.children.findIndex((node) => {
			return node.type === "html" && node.value.trim() === "<!-- excerpt -->";
		});
		if (marker !== -1) {
			tree.children.splice(marker);
			return;
		}

		let length = 0;
		let truncated = false;

		function truncate(nodes: Array<RootContent>): void {
			for (const [index, node] of nodes.entries()) {
				if (node.type === "text") {
					length += node.value.length;
					if (length > maxLength) {
						// Preserve the previous excerpt plugin's truncation semantics.
						node.value = `${node.value.slice(0, maxLength - length - 1).replace(/\W+$/, "")}...`;
						truncated = true;
					}
				} else if ("children" in node) {
					truncate(node.children);
				}
				if (truncated) {
					nodes.splice(index + 1);
					return;
				}
			}
		}

		truncate(tree.children);
	};
};
