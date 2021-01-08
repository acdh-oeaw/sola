/**
 * Logs messages to the console.
 */
export const log = {
  success(message: string): void {
    console.info('✅', message)
  },
  warn(message: string): void {
    console.warn('⚠️', message)
  },
  error(message: string): void {
    console.error('⛔', message)
  },
}
