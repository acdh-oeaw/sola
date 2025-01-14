import { axisTop } from "d3-axis";
import { scaleTime } from "d3-scale";
import { select } from "d3-selection";
import { useEffect, useRef } from "react";

import type { SolaEntityDetails } from "@/api/sola/client";
import { useDimensions } from "@/lib/visualization/useDimensions";
import { useDuration } from "@/lib/visualization/useDuration";
import { config } from "@/modules/visualization/config";

export function DurationTimeline({ entity }: { entity: SolaEntityDetails }): JSX.Element | null {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const dimensions = useDimensions(wrapperRef);
	const { beginAxis, endAxis, minDate, maxDate, getStartDate, getEndDate } = useDuration(entity);
	const startDate = getStartDate();
	const endDate = getEndDate();

	useEffect(() => {
		if (svgRef.current === null || dimensions === null || entity.primary_date == null) {
			return;
		}

		const xScale = scaleTime()
			.domain([beginAxis, endAxis])
			.range([config.canvasMarginX, dimensions.width - config.canvasMarginX]);

		const xAxisBottom = axisTop<Date>(xScale).tickFormat((d) => {
			// multi-scale time format: show full year for january, and month for the rest
			return d.getMonth() > 0
				? d.toLocaleDateString(undefined, { month: "short" })
				: d.toLocaleDateString(undefined, { year: "numeric" });
		});

		select<SVGGElement, unknown>("g.timeline-x-axis-top")
			.attr("transform", `translate(0,${config.canvasMarginY})`)
			.classed("text-gray-400", true)
			.call(xAxisBottom);

		select(svgRef.current)
			.select("g.timeline-canvas")
			.selectAll("rect")
			.data([entity])
			.join("rect")
			.attr("rx", config.nodeRadius)
			.attr("x", () => {
				return xScale(startDate.date);
			})
			.attr("y", 15 /* yScale.bandwidth() + yScale('selected')! */)
			.attr("width", () => {
				return (
					Math.abs(xScale(endDate.date) - xScale(startDate.date)) ||
					// in case of discrete point, i.e. width = 0, ensure 10px
					10
				);
			})
			.attr("height", config.nodeRadius * 2)
			.attr("fill", () => {
				if (startDate.blur !== 0 && endDate.blur !== 0) {
					return "url(#fade-to-both)";
				}
				if (endDate.blur !== 0) {
					return "url(#fade-to-right)";
				}
				if (startDate.blur !== 0) {
					return "url(#fade-to-left)";
				}
				return "hsl(0, 0%, 56%)";
			});
	}, [entity, dimensions, beginAxis, endAxis, startDate, endDate]);

	if (entity.primary_date == null) {
		return null;
	}

	const range = maxDate - minDate;
	const offsetLeft = range <= 0 ? 0 : Math.min(startDate.blur / range, 0.5);
	const offsetRight = range <= 0 ? 1 : 1 - Math.min(endDate.blur / range, 0.5);

	return (
		<div ref={wrapperRef} className="absolute inset-0">
			<svg ref={svgRef} className="w-full h-full">
				<defs>
					<linearGradient id="fade-to-right" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="hsl(0, 0%, 56%)" />
						<stop offset={offsetRight} stopColor="hsl(0, 0%, 56%)" />
						<stop offset="1" stopColor="hsl(0, 0%, 100%)" />
					</linearGradient>
					<linearGradient id="fade-to-left" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="hsl(0, 0%, 100%)" />
						<stop offset={offsetLeft} stopColor="hsl(0, 0%, 56%)" />
						<stop offset="1" stopColor="hsl(0, 0%, 56%)" />
					</linearGradient>
					<linearGradient id="fade-to-both" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="hsl(0, 0%, 100%)" />
						<stop offset={offsetLeft} stopColor="hsl(0, 0%, 56%)" />
						{/* <stop offset="0.5" stopColor="hsl(0, 0%, 56%)" /> */}
						<stop offset={offsetRight} stopColor="hsl(0, 0%, 56%)" />
						<stop offset="1" stopColor="hsl(0, 0%, 100%)" />
					</linearGradient>
				</defs>
				<g className="timeline-canvas" />
				<g className="timeline-x-axis-top" />
			</svg>
		</div>
	);
}
