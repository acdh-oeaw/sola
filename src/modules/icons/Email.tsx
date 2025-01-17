export interface EmailProps {
	className?: string;
}

export function Email({ className }: EmailProps): JSX.Element {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 20 20"
			fill="currentColor"
			className={className}
			aria-hidden
		>
			<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
			<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
		</svg>
	);
}
