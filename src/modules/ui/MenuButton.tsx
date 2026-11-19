import type { JSX, ReactNode } from "react";
import {
	Button,
	Menu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps,
	MenuTrigger,
	type MenuTriggerProps,
	Popover,
} from "react-aria-components";

export interface MenuButtonProps<T> extends Omit<MenuTriggerProps, "children">, MenuProps<T> {
	label: ReactNode;
	menuLabel: string;
}

export function MenuButton<T extends object>(props: MenuButtonProps<T>): JSX.Element {
	const { defaultOpen, isOpen, label, menuLabel, onOpenChange, trigger, ...menuProps } = props;

	return (
		<MenuTrigger
			defaultOpen={defaultOpen}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			trigger={trigger}
		>
			<Button className="flex items-center justify-between px-4 py-2 space-x-1 transition rounded-sm outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-yellow-400 data-hovered:bg-gray-100 data-pressed:bg-gray-100">
				{label}
			</Button>
			<Popover offset={4} placement="bottom end">
				<Menu
					{...menuProps}
					aria-label={menuLabel}
					className="py-1 bg-white rounded-sm shadow-lg w-max outline-hidden"
				/>
			</Popover>
		</MenuTrigger>
	);
}

export interface MenuItemProps<T> extends Omit<AriaMenuItemProps<T>, "className"> {
	/** Marks the item as the current page. */
	isCurrent?: boolean;
}

export function MenuItem<T extends object>(props: MenuItemProps<T>): JSX.Element {
	const { isCurrent = false, ...itemProps } = props;

	return (
		<AriaMenuItem
			{...itemProps}
			/**
			 * `react-aria-components` does not forward `aria-current` to the DOM element.
			 */
			ref={(element) => {
				if (isCurrent) element?.setAttribute("aria-current", "page");
				else element?.removeAttribute("aria-current");
			}}
			className="block px-4 py-2 text-base font-medium transition cursor-pointer select-none outline-hidden data-focused:bg-gray-100"
		/>
	);
}
