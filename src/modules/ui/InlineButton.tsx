import { useButton } from '@react-aria/button'
import type { AriaButtonProps } from '@react-types/button'
import type { ReactNode } from 'react'
import { useRef } from 'react'

export interface InlineButtonProps extends AriaButtonProps<'span'> {
  children?: ReactNode
  className?: string
}

/**
 * Button with `display: inline`.
 *
 * @see https://html.spec.whatwg.org/multipage/rendering.html#button-layout
 */
export function InlineButton({
  className,
  children,
  ...props
}: InlineButtonProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null)
  const { buttonProps } = useButton({ ...props, elementType: 'span' }, ref)

  return (
    <span className={className} {...buttonProps}>
      {children}
    </span>
  )
}
