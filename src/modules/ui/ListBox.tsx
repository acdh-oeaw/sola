import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useListBox, useListBoxSection, useOption } from '@react-aria/listbox'
import { useSeparator } from '@react-aria/separator'
import { mergeProps } from '@react-aria/utils'
import type { ListState } from '@react-stately/list'
import { useListState } from '@react-stately/list'
import type { AriaListBoxProps } from '@react-types/listbox'
import type { Node } from '@react-types/shared'
import cx from 'clsx'
import type { ReactNode } from 'react'
import { Fragment, useRef } from 'react'

import { CheckMark } from '@/modules/icons/CheckMark'
import { Label } from '@/modules/ui/Label'

export { Item, Section } from '@react-stately/collections'

export interface ListBoxProps<T> extends AriaListBoxProps<T> {
  label?: ReactNode
}

export function ListBox<T extends object>(props: ListBoxProps<T>): JSX.Element {
  const state = useListState<T>(props)
  const ref = useRef<HTMLUListElement>(null)
  const { listBoxProps, labelProps } = useListBox(props, state, ref)

  return (
    <div className="space-y-1">
      {props.label !== undefined ? <Label {...labelProps}>{props.label}</Label> : null}
      <ul
        {...listBoxProps}
        ref={ref}
        className="py-1 space-y-1 overflow-y-auto text-sm bg-white rounded max-h-32"
      >
        {[...state.collection].map((item) => {
          return item.type === 'section' ? (
            <Section key={item.key} section={item} state={state} />
          ) : (
            <Option key={item.key} item={item} state={state} />
          )
        })}
      </ul>
    </div>
  )
}

interface OptionProps<T> {
  item: Node<T>
  state: ListState<T>
}

/** @private */
function Option<T>({ item, state }: OptionProps<T>) {
  const ref = useRef<HTMLLIElement>(null)
  const isDisabled = state.disabledKeys.has(item.key)
  const isSelected = state.selectionManager.isSelected(item.key)
  const { optionProps } = useOption(
    {
      key: item.key,
      isDisabled,
      isSelected,
    },
    state,
    ref,
  )

  const { isFocusVisible, focusProps } = useFocusRing()
  const { isHovered, hoverProps } = useHover({})

  return (
    <li
      {...mergeProps(hoverProps, focusProps, optionProps)}
      ref={ref}
      className={cx(
        'flex items-center px-2 cursor-default',
        (isFocusVisible || isHovered) && 'bg-gray-100',
      )}
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 mr-1">
        {isSelected ? <CheckMark className="w-4 h-4" /> : null}
      </div>
      {item.rendered}
    </li>
  )
}

interface SectionProps<T> {
  section: Node<T>
  state: ListState<T>
}

function Section<T>({ section, state }: SectionProps<T>) {
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  })

  const { separatorProps } = useSeparator({
    elementType: 'li',
  })

  return (
    <Fragment>
      {section.key !== state.collection.getFirstKey() && (
        <li {...separatorProps} className="border-t border-gray-200 mx-0.5 my-1" />
      )}
      <li {...itemProps}>
        {section.rendered != null && (
          <span {...headingProps} className="inline-block px-2 py-1 font-medium select-none">
            {section.rendered}
          </span>
        )}
        <ul {...groupProps}>
          {[...section.childNodes].map((node) => {
            return <Option key={node.key} item={node} state={state} />
          })}
        </ul>
      </li>
    </Fragment>
  )
}
