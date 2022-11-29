import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useTab, useTabList, useTabPanel } from '@react-aria/tabs'
import { mergeProps } from '@react-aria/utils'
import { type TabListState, useTabListState } from '@react-stately/tabs'
import type { Node } from '@react-types/shared'
import type { AriaTabListProps, AriaTabPanelProps, AriaTabProps } from '@react-types/tabs'
import cx from 'clsx'
import type { Ref } from 'react'
import { useRef } from 'react'

export { Item } from '@react-stately/collections'

export type TabsProps<T> = AriaTabListProps<T>

export function Tabs<T extends object>(props: TabsProps<T>): JSX.Element {
  const tablistRef = useRef<HTMLDivElement>(null)
  const state = useTabListState(props)
  const { tabListProps } = useTabList(props, state, tablistRef)

  return (
    <div className="space-y-4">
      <TabList {...tabListProps} tablistRef={tablistRef} state={state} />
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      <TabPanel key={state.selectedItem?.key} state={state} />
    </div>
  )
}

export interface TabPanelProps<T> extends AriaTabPanelProps {
  state: TabListState<T>
}

function TabPanel<T>(props: TabPanelProps<T>) {
  const { state, ...rest } = props

  const ref = useRef<HTMLDivElement>(null)
  const { tabPanelProps } = useTabPanel(rest, state, ref)

  return (
    <div
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      {...tabPanelProps}
      ref={ref}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {state.selectedItem?.props.children}
    </div>
  )
}

interface TabListProps<T> {
  state: TabListState<T>
  tablistRef: Ref<HTMLDivElement>
}

function TabList<T>(props: TabListProps<T>) {
  const { state, tablistRef, ...rest } = props

  return (
    <div {...rest} ref={tablistRef} className="flex space-x-4 border-b border-gray-200">
      {[...state.collection].map((item) => {
        return <Tab key={item.key} item={item} state={state} />
      })}
    </div>
  )
}

interface TabProps<T> extends AriaTabProps {
  state: TabListState<T>
  item: Node<T>
}

function Tab<T>(props: TabProps<T>) {
  const { item, state } = props
  const { key, rendered } = item

  const ref = useRef<HTMLDivElement>(null)
  const { tabProps, isSelected } = useTab({ key }, state, ref)

  const { hoverProps, isHovered } = useHover({})
  const { focusProps, isFocusVisible } = useFocusRing()

  return (
    <div
      {...mergeProps(tabProps, focusProps, hoverProps)}
      ref={ref}
      className={cx(
        'cursor-pointer pb-2 border-b',
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
