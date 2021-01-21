import cx from 'clsx'
import type { ReactNode } from 'react'

export interface ContainerProps {
  as?: keyof JSX.IntrinsicElements
  children?: ReactNode
  className?: string
}

/**
 * Wrapper for long-text page contents.
 */
export function Container({
  children,
  className,
  as: Component = 'div',
}: ContainerProps): JSX.Element {
  return (
    <Component className={cx(className, 'w-full px-6 py-12 mx-auto')}>
      {children}
    </Component>
  )
}
