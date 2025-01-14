/**
 * Assert exhaustive switch statement.
 *
 * @example
 * const value: 'apple' | 'orange' = 'apple'
 * switch (value) {
 *   case 'apple':
 *     return value
 *   default:
 *     throw new UnreachableError(value)
 * }
 */
export class UnreachableError extends Error {
	constructor(value: never) {
		super(`Unreachable: ${JSON.stringify(value)}.`);
	}
}
