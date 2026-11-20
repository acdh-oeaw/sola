import cx from "clsx";
import { useExtracted } from "next-intl";

import type { SolaBibsonomyReference, SolaTextDetails } from "@/api/sola/client";
import { Bibliography } from "@/modules/dataset/details/Bibliography";
import { Tab, TabList, TabPanel, Tabs } from "@/modules/ui/Tabs";

import styles from "@/modules/dataset/details/Texts.module.css";

export function Texts({
	primary,
	texts,
	bibliography,
}: {
	primary?: SolaTextDetails;
	texts: Array<SolaTextDetails>;
	bibliography?: Array<SolaBibsonomyReference>;
}) {
	const t = useExtracted();

	const hasPrimaryText = primary !== undefined;
	const hasAdditionalTexts =
		texts.length > 0 || (bibliography !== undefined && bibliography.length > 0);

	if (!hasPrimaryText && !hasAdditionalTexts) return null;

	const tabs = texts.map((text) => {
		return {
			id: text.kind.id,
			title: text.kind.label,
			children: (
				<div
					className="leading-6 whitespace-pre-wrap"
					dangerouslySetInnerHTML={{ __html: text.text }}
				/>
			),
		};
	});
	if (bibliography !== undefined && bibliography.length > 0) {
		tabs.push({
			id: 0,
			title: t("Bibliography"),
			children: <Bibliography bibliography={bibliography} />,
		});
	}

	return (
		<div
			className={cx(
				styles.texts,
				"grid grid-cols-2 gap-6 p-6 text-sm bg-white rounded-sm shadow-sm",
			)}
		>
			{hasPrimaryText ? (
				<div className="space-y-4">
					<div className="flex border-b border-gray-200">
						<div className="pb-2 font-semibold">{primary.kind.label}</div>
					</div>
					<div
						className="leading-6 whitespace-pre-wrap"
						dangerouslySetInnerHTML={{ __html: primary.text ?? "" }}
					/>
				</div>
			) : null}
			{hasAdditionalTexts ? (
				<Tabs>
					<TabList aria-label={t("Additional texts")} items={tabs}>
						{(item) => {
							return <Tab>{item.title}</Tab>;
						}}
					</TabList>
					{tabs.map((item) => {
						return (
							<TabPanel key={item.id} id={item.id}>
								{item.children}
							</TabPanel>
						);
					})}
				</Tabs>
			) : null}
		</div>
	);
}
