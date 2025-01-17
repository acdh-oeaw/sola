export interface ClearProps {
	className?: string;
}

export function Clear({ className }: ClearProps): JSX.Element {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 20 20"
			fill="currentColor"
			className={className}
			aria-hidden
		>
			<path
				fillRule="evenodd"
				d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
