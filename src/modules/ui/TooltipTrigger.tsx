import { useInteractionModality } from '@react-aria/interactions'
import { useTooltip, useTooltipTrigger } from '@react-aria/tooltip'
import { mergeProps } from '@react-aria/utils'
import type { TooltipTriggerState } from '@react-stately/tooltip'
import { useTooltipTriggerState } from '@react-stately/tooltip'
import type {
  AriaTooltipProps,
  TooltipTriggerProps as AriaTooltipTriggerProps,
} from '@react-types/tooltip'
import type { ReactNode } from 'react'
import { cloneElement, Fragment, isValidElement, useRef } from 'react'

export interface TooltipTriggerProps extends AriaTooltipTriggerProps {
  tooltip: string
  children: ReactNode
}

export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
  const state = useTooltipTriggerState(props)
  const ref = useRef<HTMLButtonElement>(null)
  const { triggerProps, tooltipProps } = useTooltipTrigger(props, state, ref)

  // FIXME: required to set uo global focus handlers once
  // @see https://github.com/adobe/react-spectrum/issues/1378
  useInteractionModality()

  if (!isValidElement(props.children)) {
    return <Fragment>{props.children}</Fragment>
  }

  return (
    <span className="relative inline-flex min-w-0">
      {cloneElement(props.children, { ref, ...triggerProps })}

      {state.isOpen ? (
        <Tooltip state={state} {...tooltipProps}>
          {props.tooltip}
        </Tooltip>
      ) : null}
    </span>
  )
}

interface TooltipProps extends AriaTooltipProps {
  state: TooltipTriggerState
}

function Tooltip({ state, ...props }: TooltipProps): JSX.Element {
  // FIXME:
  // @ts-expect-error needs state in next react-aria release (to allow keeping tooltip open on hover)
  const { tooltipProps } = useTooltip(props, state)

  return (
    <span
      className="absolute right-0 z-30 px-2 py-0.5 mt-1 text-xs font-medium text-gray-100 bg-gray-900 rounded w-max top-full"
      {...mergeProps(props, tooltipProps)}
    >
      {props.children}
    </span>
  )
}
