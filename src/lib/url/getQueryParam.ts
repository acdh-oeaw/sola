import { ensureArray } from '@/lib/util/ensureArray'
import { ensureScalar } from '@/lib/util/ensureScalar'

/**
 * Gets query params as single value or array of values.
 * Optionally transforms string values.
 * Returns `undefined` in case of empty string or empty array.
 */
export function getQueryParam(
  param: string | Array<string> | undefined,
  multiple: false,
): string | undefined
export function getQueryParam(
  param: string | Array<string> | undefined,
  multiple: true,
): Array<string> | undefined
export function getQueryParam<T>(
  param: string | Array<string> | undefined,
  multiple: false,
  transform: (value: string) => T,
): T | undefined
export function getQueryParam<T>(
  param: string | Array<string> | undefined,
  multiple: true,
  transform: (value: string) => T,
): Array<T> | undefined

export function getQueryParam(
  param: string | Array<string> | undefined,
  multiple: boolean,
  transform?: (value: string) => unknown,
): unknown {
  if (param === undefined) return undefined
  if (Array.isArray(param) && param.length === 0) return undefined

  if (multiple === true) {
    const values = ensureArray(param).filter((value) => !isEmptyString(value))
    if (!transform) return values
    const transformed = values
      .map(transform)
      .filter((value) => !isUndefined(value))
    return transformed.length > 0 ? transformed : undefined
  } else {
    /** Will never return `undefined`, since we check for empty array above. */
    const value = ensureScalar(param) as string
    if (isEmptyString(value)) return undefined
    if (!transform) return value
    return transform(value)
  }
}

function isEmptyString(value: unknown): value is '' {
  return value === ''
}
function isUndefined(value: unknown): value is undefined {
  return value === undefined
}
