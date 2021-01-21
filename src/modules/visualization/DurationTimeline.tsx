import { axisTop } from 'd3-axis'
import { scaleTime } from 'd3-scale'
import { select } from 'd3-selection'
import { useEffect, useRef } from 'react'

import type { SolaEntityDetails } from '@/api/sola/client'
import { useDimensions } from '@/lib/useDimensions'
import { config } from '@/modules/visualization/config'

export function DurationTimeline({
  entity,
}: {
  entity?: SolaEntityDetails
}): JSX.Element | null {
  const wrapperRef = useRef(null)
  const svgRef = useRef(null)
  const dimensions = useDimensions(wrapperRef)

  useEffect(() => {
    if (
      svgRef.current === null ||
      dimensions === null ||
      entity === undefined ||
      entity.primary_date == null
    ) {
      return
    }

    const {
      start_date: startDate,
      end_date: endDate,
      primary_date: primaryDate,
    } = entity

    // offset for scale
    const offset = 1000 * 60 * 60 * 24 * 365 * 10 // 10 years

    const minDate = new Date(startDate ?? primaryDate!).getTime() - offset
    const maxDate = new Date(endDate ?? primaryDate!).getTime() + offset

    // offset for unknown dates, should be *less* than offset for scale
    const blur = 1000 * 60 * 60 * 24 * 365 * 5 // 5 years

    function getStartDate(d: SolaEntityDetails) {
      if (d.start_date == null) {
        return new Date(d.primary_date!).getTime() - blur
      }
      if (d.start_date_is_exact !== true) {
        return new Date(d.start_date).getTime() - blur
      }
      return new Date(d.start_date).getTime()
    }
    function getEndDate(d: SolaEntityDetails) {
      if (d.end_date == null) {
        return new Date(d.primary_date!).getTime() + blur
      }
      if (d.end_date_is_exact !== true) {
        return new Date(d.end_date).getTime() + blur
      }
      return new Date(d.end_date).getTime()
    }

    const xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([config.canvasMarginX, dimensions.width - config.canvasMarginX])
    // const yScale = scaleBand()
    //   .domain(['selected'])
    //   .range([dimensions.height - config.canvasMarginY, config.canvasMarginY])

    const xAxisBottom = axisTop<Date>(xScale).tickFormat((d) => {
      // multi-scale time format: show full year for january, and month for the rest
      return d.getMonth() > 0
        ? d.toLocaleDateString(undefined, { month: 'short' })
        : d.toLocaleDateString(undefined, { year: 'numeric' })
    })

    select<SVGGElement, unknown>('g.timeline-x-axis-top')
      .attr('transform', `translate(0,${config.canvasMarginY})`)
      .classed('text-gray-400', true)
      .call(xAxisBottom)

    select(svgRef.current)
      .select('g.timeline-canvas')
      .selectAll('rect')
      .data([entity])
      .join('rect')
      .attr('rx', config.nodeRadius)
      .attr('x', (d) => {
        return xScale(getStartDate(d))
      })
      .attr('y', 15 /* yScale.bandwidth() + yScale('selected')! */)
      .attr('width', (d) => {
        // in case of discrete point, i.e. width = 0, ensure 10px
        return xScale(getEndDate(d)) - xScale(getStartDate(d)) || 10
      })
      .attr('height', config.nodeRadius * 2)
      .attr('fill', (d) => {
        if (d.end_date_is_exact !== true && d.start_date_is_exact !== true) {
          return 'url(#fade-to-both)'
        }
        if (d.end_date_is_exact !== true) {
          return 'url(#fade-to-right)'
        }
        if (d.start_date_is_exact !== true) {
          return 'url(#fade-to-left)'
        }
        return 'hsl(0, 0%, 56%)'
      })
  }, [entity, dimensions])

  if (entity === undefined || entity.primary_date == null) {
    return null
  }

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      <svg ref={svgRef} className="w-full h-full">
        <defs>
          <linearGradient id="fade-to-right" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="hsl(0, 0%, 56%)" />
            <stop offset="1" stopColor="hsl(0, 0%, 100%)" />
          </linearGradient>
          <linearGradient id="fade-to-left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="hsl(0, 0%, 100%)" />
            <stop offset="1" stopColor="hsl(0, 0%, 56%)" />
          </linearGradient>
          <linearGradient id="fade-to-both" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="hsl(0, 0%, 100%)" />
            <stop offset="0.5" stopColor="hsl(0, 0%, 56%)" />
            <stop offset="1" stopColor="hsl(0, 0%, 100%)" />
          </linearGradient>
        </defs>
        <g className="timeline-canvas" />
        <g className="timeline-x-axis-top" />
      </svg>
    </div>
  )
}
