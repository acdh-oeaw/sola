import cx from 'clsx'
import type { ReactNode } from 'react'

export interface LabelProps {
  as?: keyof JSX.IntrinsicElements
  children: ReactNode
  className?: string
}

export function Label({
  children,
  className,
  as: Component = 'label',
  ...props
}: LabelProps): JSX.Element {
  return (
    <Component
      className={cx(
        'inline-block text-xs font-semibold leading-4 tracking-wide text-gray-300',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
