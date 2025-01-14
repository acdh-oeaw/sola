export interface DocumentProps {
	className?: string;
}

export function Document({ className }: DocumentProps): JSX.Element {
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
				d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
