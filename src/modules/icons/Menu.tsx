export interface MenuProps {
	className?: string;
}

export function Menu({ className }: MenuProps): JSX.Element {
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
				d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
