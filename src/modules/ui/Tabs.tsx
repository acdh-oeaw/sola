import type { JSX } from "react";
import {
	Tab as AriaTab,
	TabList as AriaTabList,
	type TabListProps as AriaTabListProps,
	TabPanel as AriaTabPanel,
	type TabPanelProps as AriaTabPanelProps,
	type TabProps as AriaTabProps,
	Tabs as AriaTabs,
	type TabsProps as AriaTabsProps,
} from "react-aria-components";

export type TabsProps = Omit<AriaTabsProps, "className">;

export function Tabs(props: TabsProps): JSX.Element {
	return <AriaTabs {...props} className="space-y-4" />;
}

export type TabListProps<T> = Omit<AriaTabListProps<T>, "className">;

export function TabList<T extends object>(props: TabListProps<T>): JSX.Element {
	return <AriaTabList {...props} className="flex space-x-4 border-b border-gray-200" />;
}

export type TabProps = Omit<AriaTabProps, "className">;

export function Tab(props: TabProps): JSX.Element {
	return (
		<AriaTab
			{...props}
			className="pb-2 border-b border-transparent cursor-pointer outline-hidden data-selected:font-semibold data-selected:border-gray-700 data-focus-visible:ring-2 data-focus-visible:ring-yellow-300"
		/>
	);
}

export type TabPanelProps = Omit<AriaTabPanelProps, "className">;

export function TabPanel(props: TabPanelProps): JSX.Element {
	return (
		<AriaTabPanel
			{...props}
			className="outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-yellow-400"
		/>
	);
}
