/** Object keys. */
type Keys<T> = Array<
  {
    [K in keyof T]: K
  }[keyof T]
>

/**
 * Returns object keys, works with unions as keys.
 */
export const keys = Object.keys as <T>(obj: T) => Keys<T>

/** Object values. */
type Values<T> = Array<
  {
    [K in keyof T]: T[K]
  }[keyof T]
>

/**
 * Returns object values, works with unions as keys.
 */
export const values = Object.values as <T>(obj: T) => Values<T>

/** Object entries. */
type Entries<T> = Array<
  {
    [K in keyof T]: [K, T[K]]
  }[keyof T]
>

/**
 * Returns object entries, works with unions as keys.
 */
export const entries = Object.entries as <T>(obj: T) => Entries<T>

/**
 * Mark fields as optional.
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Mark fields as required.
 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
