import cx from 'clsx'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Chevron } from '@/modules/icons/Chevron'
import { Label } from '@/modules/ui/Label'

export interface DisclosureProps {
  id?: string
  panelId: string
  initialOpen?: boolean
  title: string
  children?: ReactNode
  className?: string
}

export function Disclosure({
  id,
  panelId,
  initialOpen = false,
  title,
  children,
  className,
}: DisclosureProps): JSX.Element {
  const [isOpen, setOpen] = useState(initialOpen)

  function toggleOpen() {
    setOpen((isOpen) => !isOpen)
  }

  return (
    <div className="flex flex-col space-y-2">
      <button
        id={id}
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={cx(
          'py-1 rounded flex items-center space-x-2 text-left justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300',
          className,
        )}
        onClick={toggleOpen}
      >
        <Label as="span" className={className}>
          {title}
        </Label>
        <Chevron
          className={cx(
            'flex-shrink-0',
            isOpen ? 'transform rotate-180' : undefined,
          )}
        />
      </button>
      {isOpen ? <div id={panelId}>{children}</div> : null}
    </div>
  )
}
