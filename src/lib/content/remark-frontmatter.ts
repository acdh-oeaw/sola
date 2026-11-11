import type { Root } from "mdast";
import type { Plugin } from "unified";
import YAML from "yaml";

/** Extract the first YAML frontmatter block for the content API. */
export const parseYamlFrontmatter: Plugin<[], Root> = () => {
	return (tree, file) => {
		const frontmatter = tree.children.find((node) => {
			return node.type === "yaml";
		});
		if (frontmatter?.type === "yaml") {
			file.data.frontmatter = YAML.parse(frontmatter.value) as unknown;
		}
	};
};
