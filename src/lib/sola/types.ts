import type { SolaEntityType } from "@/api/sola/client";

export interface SolaSelectedEntity {
	id: number;
	type: SolaEntityType;
}

export interface SolaPassagesFilter {
	name?: string;
	authors?: Array<number>;
	publications?: Array<number>;
	topics?: Array<number>;
	types?: Array<number>;
}
