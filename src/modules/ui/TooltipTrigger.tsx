import type { DOMAttributes, JSX, ReactElement } from "react";
import {
	Focusable,
	Tooltip,
	TooltipTrigger as AriaTooltipTrigger,
	type TooltipTriggerComponentProps,
} from "react-aria-components";

export interface TooltipTriggerProps extends Omit<TooltipTriggerComponentProps, "children"> {
	tooltip: string;
	/** A single focusable element which forwards its `ref` and DOM props, e.g. a native `<button>`. */
	children: ReactElement<DOMAttributes<HTMLElement>, string>;
}

export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
	const { children, tooltip, ...triggerProps } = props;

	return (
		<span className="inline-flex min-w-0">
			<AriaTooltipTrigger {...triggerProps}>
				<Focusable>{children}</Focusable>
				<Tooltip
					offset={4}
					placement="bottom end"
					className="z-30 px-2 py-0.5 text-xs font-medium text-gray-100 bg-gray-900 rounded-sm w-max"
				>
					{tooltip}
				</Tooltip>
			</AriaTooltipTrigger>
		</span>
	);
}
