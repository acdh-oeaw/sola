import cx from "clsx";
import type { ReactNode } from "react";

export interface BadgeProps {
	as?: keyof JSX.IntrinsicElements;
	children: ReactNode;
	className?: string;
	variant?: "tight";
}

export function Badge({
	children,
	className,
	as: Component = "span",
	variant,
}: BadgeProps): JSX.Element {
	const classNames = cx(
		"rounded inline-flex items-center",
		variant !== "tight" && "py-0.5 px-2",
		className ?? "bg-gray-300 text-gray-700",
	);
	return <Component className={classNames}>{children}</Component>;
}
