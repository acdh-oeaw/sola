import cx from 'clsx'
import { extent } from 'd3-array'
import { axisBottom, axisLeft, axisRight, axisTop } from 'd3-axis'
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force'
import { scaleBand, scaleTime } from 'd3-scale'
import { select } from 'd3-selection'
import type { ZoomTransform } from 'd3-zoom'
import { zoom, zoomTransform } from 'd3-zoom'
import type { ComponentPropsWithoutRef, Dispatch, ReactNode, SetStateAction } from 'react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { usePopper } from 'react-popper'

import { useDimensions } from '@/lib/visualization/useDimensions'
import { config } from '@/modules/visualization/config'
import type { Node } from '@/modules/visualization/createNode'

const TOOLTIP_ID = 'tooltip'
const CLIPPATH_ID = 'bounds'

export interface TimelinesProps {
  timelines: Array<{
    label: string
    type: string
    data: Array<Node>
  }>
  getTimelineForNodeType: (type: string) => string
  getLabelForNodeType: (type: string) => string
  isNodeSelected?: (node: Node) => boolean
  isNodeHighlighted?: (node: Node) => boolean
  onNodeClick?: (node: Node) => void
}

export function Timelines({
  timelines,
  getLabelForNodeType,
  getTimelineForNodeType,
  isNodeSelected,
  isNodeHighlighted,
  onNodeClick,
}: TimelinesProps): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dimensions = useDimensions(wrapperRef)
  const [zoomState, setZoomState] = useState<ZoomTransform | null>(null)

  const [tooltipAnchor, setTooltipAnchor] = useState<SVGCircleElement | null>(null)
  const [tooltip, setTooltip] = useState<HTMLDivElement | null>(null)
  const [tooltipArrow, setTooltipArrow] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(tooltipAnchor, tooltip, {
    modifiers: [
      { name: 'offset', options: { offset: [0, 4] } },
      {
        name: 'arrow',
        options: { element: tooltipArrow, padding: 4 },
      },
    ],
  })
  const [tooltipContent, setTooltipContent] = useState<Node | null>(null)

  const data = timelines
  const { width, height } = dimensions ?? {}

  useEffect(() => {
    if (svgRef.current === null || width === undefined || height === undefined) return

    const svg = select(svgRef.current)

    // xscale extent
    const [min, max] = extent(
      data
        .map((d) => {
          return d.data.map((d) => {
            return d.date
          })
        })
        .flat(),
    ) as [Date, Date]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (min === undefined || max === undefined) return
    const minDate = new Date(min.getFullYear() - config.timelinePadding, 0)
    const maxDate = new Date(max.getFullYear() + config.timelinePadding, 0)

    // scales
    const xScale = scaleTime()
      .domain([minDate, maxDate])
      .range([config.canvasMarginX, width - config.canvasMarginX])
    const yScale = scaleBand()
      .domain(
        data.map((d) => {
          return d.label
        }),
      )
      .range([height - config.canvasMarginY, config.canvasMarginY])

    // rescale
    if (zoomState !== null) {
      const zoomedXScale = zoomState.rescaleX(xScale)
      xScale.domain(zoomedXScale.domain())
    }

    // axes
    const xAxisTop = axisTop<Date>(xScale).tickFormat((d) => {
      // multi-scale time format: show full year for january, and month for the rest
      return d.getMonth() > 0
        ? d.toLocaleDateString(undefined, { month: 'short' })
        : d.toLocaleDateString(undefined, { year: 'numeric' })
    })
    const xAxisBottom = axisBottom<Date>(xScale).tickFormat((d) => {
      // multi-scale time format: show full year for january, and month for the rest
      return d.getMonth() > 0
        ? d.toLocaleDateString(undefined, { month: 'short' })
        : d.toLocaleDateString(undefined, { year: 'numeric' })
    })
    const yAxisLeft = axisLeft(yScale)
    const yAxisRight = axisRight(yScale)

    select<SVGGElement, unknown>('g.x-axis-top')
      .attr('transform', `translate(0,${config.canvasMarginY})`)
      .classed('text-gray-400', true)
      .call(xAxisTop)
    select<SVGGElement, unknown>('g.x-axis-bottom')
      .attr('transform', `translate(0,${height - config.canvasMarginY})`)
      .classed('text-gray-400', true)
      .call(xAxisBottom)
    select<SVGGElement, unknown>('g.y-axis-left')
      .attr('transform', `translate(${config.canvasMarginX},0)`)
      .classed('text-gray-400', true)
      .call(yAxisLeft)
      // rotate axis labels
      .selectAll('text')
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', -15)
    select<SVGGElement, unknown>('g.y-axis-right')
      .attr('transform', `translate(${width - config.canvasMarginX},0)`)
      .classed('text-gray-400', true)
      .call(yAxisRight)
      // rotate axis labels
      .selectAll('text')
      .attr('transform', 'rotate(90)')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', -15)

    // zoom
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([config.minScale, config.maxScale])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', () => {
        if (svgRef.current !== null) {
          setZoomState(zoomTransform(svgRef.current))
        }
      })
    svg.call(zoomBehavior)

    // simulation data
    const simulationData = data.flatMap((series) => {
      return series.data.map((d) => {
        // ensure initial node position for simulation is the actual datapoint, not [0,0]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        d.x = d.x ?? xScale(d.date) ?? null
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-non-null-assertion
        d.y = d.y ?? yScale(getTimelineForNodeType(d.type))! + yScale.bandwidth() / 2 ?? null
        return d
      })
    })

    // nodes selection
    const nodes = svg
      .select('g.canvas')
      .selectAll('circle')
      .data(simulationData)
      .join('circle')
      .attr('r', config.nodeRadius)
      .attr('class', 'cursor-pointer')

    // init simulation
    const simulation = forceSimulation()
      .force(
        'collide',
        forceCollide(config.nodeRadius + config.nodePadding).strength(config.collideStrength),
      )
      .force(
        'x',
        forceX<Node>((d) => {
          return xScale(d.date)
        }).strength(config.xStrength),
      )
      .force(
        'y',
        forceY<Node>((d) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return yScale(getTimelineForNodeType(d.type))! + yScale.bandwidth() / 2
        }).strength(config.yStrength),
      )

    // simulate: on tick adjust node.x and node.y
    simulation
      .on('tick', () => {
        nodes
          .attr('cx', (d) => {
            return d.x ?? null
          })
          .attr('cy', (d) => {
            return d.y ?? null
          })
        // fast-forward 5 ticks, to only draw every 6th tick
        simulation.tick(5)
      })
      .nodes(simulationData)

    return () => {
      simulation.stop()
    }
  }, [data, getTimelineForNodeType, svgRef, width, height, zoomState])

  useEffect(() => {
    if (svgRef.current === null) return

    // separate effect for node colors so we ensure to keep node positions
    // when changing node selection and filters
    select(svgRef.current)
      .select('g.canvas')
      .selectAll<SVGCircleElement, Node>('circle')
      /** Set fill color to currentColor, and use tailwind text-* class to set actual color. */
      .attr('class', (d) => {
        if (typeof isNodeSelected === 'function') {
          if (isNodeSelected(d)) {
            return config.nodeSelectionColor
          }
        }

        return d.color
      })
      .attr('fill', 'currentColor')
      /** Dim nodes not matching the current filter set. */
      .attr('opacity', (d) => {
        if (typeof isNodeHighlighted === 'function' && typeof isNodeSelected === 'function') {
          if (!isNodeHighlighted(d) && !isNodeSelected(d)) {
            return config.nodeHighlightOpacity
          }
        }
        return null
      })
      .on('click', (_event, node) => {
        if (typeof onNodeClick === 'function') {
          onNodeClick(node)
        }
      })
      .on('mouseenter', (event, d) => {
        const element = event.target
        element.setAttribute('aria-describedby', TOOLTIP_ID)
        setTooltipContent(d)
        setTooltipAnchor(element)
      })
      .on('mouseleave', (event) => {
        const element = event.target
        element.removeAttribute('aria-describedby')
        setTooltipAnchor(null)
      })
  }, [svgRef, width, height, data, isNodeSelected, isNodeHighlighted, onNodeClick, zoomState])

  return (
    <div aria-hidden ref={wrapperRef} className="absolute inset-0">
      <svg ref={svgRef} className="w-full h-full overflow-vísible">
        <defs>
          <clipPath id={CLIPPATH_ID}>
            {dimensions ? (
              <rect
                transform={`translate(${config.canvasMarginX},${config.canvasMarginY})`}
                width={dimensions.width - 2 * config.canvasMarginX}
                height={dimensions.height - 2 * config.canvasMarginY}
                fill="none"
              />
            ) : null}
          </clipPath>
        </defs>
        <g className="canvas" clipPath={`url(#${CLIPPATH_ID})`} />
        <g className="x-axis-top" />
        <g className="x-axis-bottom" />
        <g className="y-axis-left" />
        <g className="y-axis-right" />
      </svg>
      <Tooltip
        setTooltip={setTooltip}
        style={styles['popper']}
        {...attributes['popper']}
        isVisible={tooltipAnchor !== null}
      >
        <TooltipArrow
          setTooltipArrow={setTooltipArrow}
          style={styles['arrow']}
          {...attributes['arrow']}
        />
        {tooltipContent !== null ? (
          <div className="flex flex-col space-y-1">
            <div className="font-medium tracking-wider text-gray-500 uppercase">
              {getLabelForNodeType(tooltipContent.type)}
            </div>
            <div>{tooltipContent.label}</div>
          </div>
        ) : null}
      </Tooltip>
    </div>
  )
}

// eslint-disable-next-line react/function-component-definition
const Tooltip = function Tooltip({
  children,
  isVisible,
  setTooltip,
  ...props
}: ComponentPropsWithoutRef<'div'> & {
  children: ReactNode
  isVisible: boolean
  setTooltip: Dispatch<SetStateAction<HTMLDivElement | null>>
}) {
  return (
    <div
      ref={setTooltip}
      id={TOOLTIP_ID}
      role="tooltip"
      className={cx(
        'p-2 text-xs transition-opacity duration-150 rounded shadow-lg bg-gray-50 pointer-events-none z-30',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function TooltipArrow({
  setTooltipArrow,
  ...props
}: ComponentPropsWithoutRef<'div'> & {
  setTooltipArrow: Dispatch<SetStateAction<HTMLDivElement | null>>
}) {
  return (
    <Fragment>
      <div ref={setTooltipArrow} className="tooltip-arrow" {...props} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style global jsx>{`
        .tooltip-arrow,
        .tooltip-arrow::before {
          position: absolute;
          width: 8px;
          height: 8px;
          z-index: -1;
          background: inherit;
        }

        .tooltip-arrow::before {
          content: '';
          transform: rotate(45deg);
          background: inherit;
        }

        // this will only work with global styled-jsx
        #${TOOLTIP_ID}[data-popper-placement^='bottom'] .tooltip-arrow {
          top: -4px;
        }
        #${TOOLTIP_ID}[data-popper-placement^='top'] .tooltip-arrow {
          bottom: -4px;
        }
      `}</style>
    </Fragment>
  )
}
