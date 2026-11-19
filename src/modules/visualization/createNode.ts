import type { SimulationNodeDatum } from "d3-force";

import type { SolaListEntity } from "@/api/sola/client";

export interface Node extends SimulationNodeDatum {
	id: number;
	label: string;
	date: Date;
	type: string;
	color: string;
}

export function createNode(entity: SolaListEntity, color: string): Node {
	return {
		id: entity.id,
		label: entity.name,
		date: new Date(entity.primary_date!),
		type: entity.type,
		color,
	};
}
