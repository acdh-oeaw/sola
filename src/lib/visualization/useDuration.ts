import type { SolaEntityDetails } from '@/api/sola/client'

/* offset for axis scale, in percent of full date range */
const offset = 0.25
/** blurred padding for unknown inexact start/end ranges, in percent of full date range */
const padding = 0.25

const year = 1000 * 60 * 60 * 24 * 365

interface DatePoint {
  date: number
  blur: number
}

/**
 * Returns min and max dates, and a blur range if a date is inexact.
 */
export function useDuration(
  entity: SolaEntityDetails,
): {
  beginAxis: number
  endAxis: number
  minDate: number
  maxDate: number
  getStartDate: () => DatePoint
  getEndDate: () => DatePoint
} {
  const {
    start_date: startDate,
    start_start_date: startStartDate,
    start_end_date: startEndDate,
    start_date_is_exact: isStartDateExact,
    end_date: endDate,
    end_start_date: endStartDate,
    end_end_date: endEndDate,
    end_date_is_exact: isEndDateExact,
    primary_date: primaryDate,
  } = entity

  const startDates = parseDates([startStartDate, startDate, startEndDate])
  const endDates = parseDates([endStartDate, endDate, endEndDate])
  const dates = [...startDates, ...parseDates([primaryDate]), ...endDates]

  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)

  const range = maxDate - minDate
  const axisOffset = Math.max(range * offset, year * 3) // minimum offset 1y
  const beginAxis = minDate - axisOffset
  const endAxis = maxDate + axisOffset

  function getStartDate(): DatePoint {
    /** Start date explicitly marked as exact. */
    if (isStartDateExact === true) {
      return { date: minDate, blur: 0 }
    }

    /**
     * Start range defined. If range === 0 (e.g. start_start_date === start_end_date),
     * add a default padding.
     */
    if (startDates.length >= 2) {
      const blur =
        Math.abs(Math.max(...startDates) - Math.min(...startDates)) ||
        range * padding
      return { date: minDate, blur }
    }

    const blur = padding * range

    /** Add blurred padding before the start date. */
    return { date: minDate - blur, blur }
  }

  function getEndDate(): DatePoint {
    /** End date explicitly marked as exact. */
    if (isEndDateExact === true) {
      return { date: maxDate, blur: 0 }
    }

    /**
     * End range defined. If range === 0 (e.g. end_start_date === end_end_date),
     * add a default padding.
     */
    if (endDates.length >= 2) {
      const blur =
        Math.abs(Math.max(...endDates) - Math.min(...endDates)) ||
        range * padding
      return { date: maxDate, blur }
    }

    const blur = padding * range

    /** Add blurred padding after the emd date. */
    return { date: maxDate + blur, blur }
  }

  return {
    beginAxis,
    endAxis,
    minDate,
    maxDate,
    getStartDate,
    getEndDate,
  }
}

function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null
}

function parseDates(maybeDates: Array<string | null>) {
  return maybeDates
    .filter(isNonNull)
    .map((d) => new Date(d).getTime())
    .filter((d) => !Number.isNaN(d))
}
