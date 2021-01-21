import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useTab, useTabs } from '@react-aria/tabs'
import { mergeProps } from '@react-aria/utils'
import type { SingleSelectListState } from '@react-stately/list'
import { useTabsState } from '@react-stately/tabs'
import type { AriaTabProps, AriaTabsProps } from '@react-types/tabs'
import cx from 'clsx'
import type { Ref } from 'react'
import { useRef } from 'react'

export { Item } from '@react-stately/collections'

export type TabsProps<T> = AriaTabsProps<T>

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function Tabs<T extends object>(props: TabsProps<T>): JSX.Element {
  const tablistRef = useRef<HTMLDivElement>(null)
  const state = useTabsState(props)
  const { tabListProps, tabPanelProps } = useTabs(props, state, tablistRef)

  return (
    <div className="space-y-4">
      <TabList {...tabListProps} tablistRef={tablistRef} state={state} />
      <div className="focus:outline-none" {...tabPanelProps}>
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {state.selectedItem != null ? state.selectedItem.props.children : null}
      </div>
    </div>
  )
}

interface TabListProps<T> {
  state: SingleSelectListState<T>
  tablistRef: Ref<HTMLDivElement>
}

function TabList<T>(props: TabListProps<T>) {
  const { state, tablistRef, ...rest } = props

  return (
    <div
      {...rest}
      ref={tablistRef}
      className="flex space-x-4 border-b border-gray-200"
    >
      {[...state.collection].map((item) => (
        <Tab key={item.key} item={item} state={state} />
      ))}
    </div>
  )
}

interface TabProps<T> extends AriaTabProps<T> {
  state: SingleSelectListState<T>
}

function Tab<T>(props: TabProps<T>) {
  const { item, state } = props
  const { key, rendered } = item

  const ref = useRef<HTMLDivElement>(null)
  const { tabProps } = useTab({ item }, state, ref)

  const { hoverProps, isHovered } = useHover({})
  const { focusProps, isFocusVisible } = useFocusRing()
  const isSelected = state.selectedKey === key

  return (
    <div
      {...mergeProps(tabProps, focusProps, hoverProps)}
      ref={ref}
      className={cx(
        'rounded cursor-pointer py-2 border-b',
        'focus:outline-none',
        isSelected ? 'font-semibold border-gray-700' : 'border-transparent',
        isHovered && '',
        isFocusVisible && 'ring-2 ring-yellow-300',
      )}
    >
      {rendered}
    </div>
  )
}
