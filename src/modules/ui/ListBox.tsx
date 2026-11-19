import type { JSX, ReactNode } from "react";
import {
	Collection,
	Header,
	ListBox as AriaListBox,
	ListBoxItem as AriaListBoxItem,
	type ListBoxItemProps as AriaListBoxItemProps,
	type ListBoxProps as AriaListBoxProps,
	ListBoxSection as AriaListBoxSection,
} from "react-aria-components";

import { CheckMark } from "@/modules/icons/CheckMark";

export type ListBoxProps<T> = Omit<AriaListBoxProps<T>, "className">;

export function ListBox<T extends object>(props: ListBoxProps<T>): JSX.Element {
	return (
		<AriaListBox
			{...props}
			className="py-1 space-y-1 overflow-y-auto text-sm bg-white rounded-sm max-h-32 outline-hidden"
		/>
	);
}

export interface ListBoxItemProps<T> extends Omit<
	AriaListBoxItemProps<T>,
	"children" | "className"
> {
	children: string;
}

export function ListBoxItem<T extends object>(props: ListBoxItemProps<T>): JSX.Element {
	const { children, ...itemProps } = props;

	return (
		<AriaListBoxItem
			textValue={children}
			{...itemProps}
			className="flex items-center px-2 cursor-default outline-hidden data-focus-visible:bg-gray-100 data-hovered:bg-gray-100"
		>
			{({ isSelected }) => {
				return (
					<>
						<span className="inline-flex items-center justify-center shrink-0 w-5 h-5 mr-1">
							{isSelected ? <CheckMark className="w-4 h-4" /> : null}
						</span>
						{children}
					</>
				);
			}}
		</AriaListBoxItem>
	);
}

export interface ListBoxSectionProps<T> {
	id: string;
	title: ReactNode;
	items: Iterable<T>;
	children: (item: T) => JSX.Element;
}

export function ListBoxSection<T extends object>(props: ListBoxSectionProps<T>): JSX.Element {
	const { children, id, items, title } = props;

	return (
		<AriaListBoxSection
			id={id}
			className="not-first:pt-1 not-first:border-t not-first:border-gray-200"
		>
			<Header className="inline-block px-2 py-1 font-medium select-none">{title}</Header>
			<Collection items={items}>{children}</Collection>
		</AriaListBoxSection>
	);
}
