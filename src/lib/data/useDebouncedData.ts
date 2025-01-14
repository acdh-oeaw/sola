import { useEffect, useState } from "react";

export function useDebouncedData<T>(data: T, delay: number): T {
	const [debouncedData, setDebouncedData] = useState(data);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedData(data);
		}, delay);
		return () => {
			clearTimeout(timeout);
		};
	}, [data, delay]);

	return debouncedData;
}
