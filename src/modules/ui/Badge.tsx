import cx from 'clsx'
import type { ReactNode } from 'react'

export interface BadgeProps {
  as?: keyof JSX.IntrinsicElements
  children: ReactNode
  className?: string
}

export function Badge({
  children,
  className,
  as: Component = 'span',
}: BadgeProps): JSX.Element {
  const classNames = cx(
    'py-0.5 px-2 rounded inline-flex items-center',
    className ?? 'bg-gray-300 text-gray-700',
  )
  return <Component className={classNames}>{children}</Component>
}
