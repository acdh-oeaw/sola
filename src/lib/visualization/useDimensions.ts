import type { RefObject } from "react";
import { useEffect, useState } from "react";

/**
 * Returns dimensions of an element on resize events.
 *
 * Needs ResizeObserver polyfill for Safari <= 13.1 and Edge <= 18.
 *
 * @param ref React ref to the element to observe.
 */
export function useDimensions(ref: RefObject<HTMLElement>): DOMRectReadOnly | null {
	const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);

	useEffect(() => {
		const target = ref.current;
		if (target === null) return;

		const observer = new ResizeObserver(([entry]) => {
			if (entry !== undefined) {
				setDimensions(entry.contentRect);
			}
		});

		observer.observe(target);

		return () => {
			observer.unobserve(target);
		};
	}, [ref]);

	if (dimensions) return dimensions;
	if (ref.current !== null) return ref.current.getBoundingClientRect();
	return null;
}
