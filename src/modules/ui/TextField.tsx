import cx from "clsx";
import type { JSX, ReactNode } from "react";
import {
	Input,
	Label,
	TextField as AriaTextField,
	type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

export interface TextFieldProps extends Omit<AriaTextFieldProps, "children" | "className"> {
	label: ReactNode;
	/** Applied to the input element. */
	className?: string;
}

export function TextField(props: TextFieldProps): JSX.Element {
	const { className, label, ...fieldProps } = props;

	return (
		<AriaTextField {...fieldProps} className="flex flex-col space-y-1">
			<Label className="inline-block text-xs font-semibold leading-4 tracking-wide text-gray-300">
				{label}
			</Label>
			<Input
				className={cx("px-2 py-1 text-sm rounded-sm bg-white", className)}
				autoComplete="off"
				autoCorrect="off"
			/>
		</AriaTextField>
	);
}
