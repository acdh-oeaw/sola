import { useButton } from '@react-aria/button'
import { FocusScope } from '@react-aria/focus'
import { useMenu, useMenuItem, useMenuTrigger } from '@react-aria/menu'
import { DismissButton, useOverlay } from '@react-aria/overlays'
import { mergeProps } from '@react-aria/utils'
import { useMenuTriggerState } from '@react-stately/menu'
import type { TreeState } from '@react-stately/tree'
import { useTreeState } from '@react-stately/tree'
import type { AriaMenuProps, MenuTriggerProps } from '@react-types/menu'
import type { CollectionChildren, Node } from '@react-types/shared'
import cx from 'clsx'
import Link from 'next/link'
import type { HTMLAttributes, Key, ReactNode, RefObject } from 'react'
import { useRef } from 'react'

export { Item } from '@react-stately/collections'

export interface MenuButtonProps<T> extends MenuTriggerProps {
  label?: ReactNode
  children: CollectionChildren<T>
}

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function MenuButton<T extends object>(
  props: MenuButtonProps<T>,
): JSX.Element {
  const state = useMenuTriggerState(props)
  const ref = useRef<HTMLButtonElement>(null)
  const { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref)
  const { buttonProps } = useButton(menuTriggerProps, ref)

  return (
    <div className="relative inline-block">
      <button
        {...buttonProps}
        ref={ref}
        className={cx(
          'flex items-center justify-between px-4 py-2 space-x-1 transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 hover:bg-gray-100',
          state.isOpen && 'bg-gray-100',
        )}
      >
        {props.label}
      </button>
      {state.isOpen ? (
        <Menu
          {...props}
          domProps={menuProps}
          autoFocus={state.focusStrategy}
          onClose={state.close}
        />
      ) : null}
    </div>
  )
}

interface MenuProps<T> extends AriaMenuProps<T> {
  domProps: HTMLAttributes<HTMLElement>
  onClose?: () => void
}

/** @private */
/* eslint-disable-next-line @typescript-eslint/ban-types */
function Menu<T extends object>(props: MenuProps<T>): JSX.Element {
  const state = useTreeState<T>({ ...props, selectionMode: 'none' })
  const ref = useRef<HTMLUListElement>(null)
  const { menuProps } = useMenu<T>(props, state, ref)

  const overlayRef = useRef(null)
  const { overlayProps } = useOverlay(
    {
      onClose: props.onClose,
      shouldCloseOnBlur: true,
      isOpen: true,
      isDismissable: true,
    },
    overlayRef,
  )

  return (
    <FocusScope restoreFocus>
      <div {...overlayProps} ref={overlayRef}>
        <DismissButton onDismiss={props.onClose} />
        <ul
          {...mergeProps(menuProps, props.domProps)}
          ref={ref}
          className="absolute py-1 mt-1 bg-white rounded shadow-lg"
        >
          {[...state.collection].map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              state={state}
              onAction={props.onAction}
              onClose={props.onClose}
            />
          ))}
        </ul>
        <DismissButton onDismiss={props.onClose} />
      </div>
    </FocusScope>
  )
}

interface MenuItemProps<T> {
  item: Node<T>
  state: TreeState<T>
  onAction?: (key: Key) => void
  onClose?: () => void
}

/** @private */
function MenuItem<T>({ item, state, onAction, onClose }: MenuItemProps<T>) {
  const ref = useRef<HTMLLIElement | HTMLAnchorElement>(null)
  const isDisabled = state.disabledKeys.has(item.key)
  const isFocused = state.selectionManager.focusedKey === item.key
  const { menuItemProps } = useMenuItem(
    {
      key: item.key,
      isDisabled,
      onAction,
      onClose,
    },
    state,
    ref,
  )

  if (item.props.elementType === 'a') {
    return (
      <li role="none" className="flex">
        <Link href={item.props.href}>
          <a
            {...menuItemProps}
            aria-current={item.props['aria-current']}
            ref={ref as RefObject<HTMLAnchorElement>}
            className={cx(
              'font-base flex-1 px-4 py-2 focus:outline-none cursor-pointer transition w-max',
              isFocused && 'bg-gray-100',
            )}
          >
            {item.rendered}
          </a>
        </Link>
      </li>
    )
  }

  return (
    <li
      {...menuItemProps}
      ref={ref as RefObject<HTMLLIElement>}
      className={cx(
        'font-base flex px-4 py-2 focus:outline-none cursor-pointer transition w-max',
        isFocused && 'bg-gray-100',
      )}
    >
      {item.rendered}
    </li>
  )
}
