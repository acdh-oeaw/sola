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
import { useRouter } from 'next/router'
import type { HTMLAttributes, Key, ReactNode, RefObject } from 'react'
import { useEffect, useRef } from 'react'

export { Item } from '@react-stately/collections'

export interface MenuButtonProps<T> extends MenuTriggerProps {
  label?: ReactNode
  menuLabel?: string
  children: CollectionChildren<T>
  onAction?: (key: Key) => void
}

/* eslint-disable-next-line @typescript-eslint/ban-types */
export function MenuButton<T extends object>(
  props: MenuButtonProps<T>,
): JSX.Element {
  const state = useMenuTriggerState(props)
  const ref = useRef<HTMLButtonElement>(null)
  const { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref)
  const { buttonProps } = useButton(menuTriggerProps, ref)

  const router = useRouter()
  useEffect(() => {
    router.events.on('routeChangeStart', state.close)
    return () => {
      router.events.off('routeChangeStart', state.close)
    }
  }, [router, state.close])

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
        <Popover isOpen={state.isOpen} onClose={state.close}>
          <Menu
            {...props}
            aria-label={props.menuLabel}
            domProps={menuProps}
            /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
            autoFocus={state.focusStrategy || true}
            onClose={state.close}
          />
        </Popover>
      ) : null}
    </div>
  )
}

interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

/** @private */
function Popover({ isOpen, onClose, children }: PopoverProps) {
  const overlayRef = useRef(null)
  const { overlayProps } = useOverlay(
    {
      onClose,
      shouldCloseOnBlur: true,
      isOpen,
      isDismissable: true,
    },
    overlayRef,
  )

  return (
    <FocusScope restoreFocus>
      <div {...overlayProps} ref={overlayRef} className="absolute z-20 mt-1">
        <DismissButton onDismiss={onClose} />
        {children}
        <DismissButton onDismiss={onClose} />
      </div>
    </FocusScope>
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

  return (
    <ul
      {...mergeProps(menuProps, props.domProps)}
      ref={ref}
      className="py-1 bg-white rounded shadow-lg w-max focus:outline-none"
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
      /**
       * With `closeOnSelect: true` navigation does not work.
       * Instead, we listen to `routeChangeStart` router event above.
       */
      closeOnSelect: false,
    },
    state,
    ref,
  )

  if (item.props.elementType === 'a') {
    return (
      <li role="none">
        <Link href={item.props.href}>
          <a
            {...menuItemProps}
            ref={ref as RefObject<HTMLAnchorElement>}
            className={cx(
              'text-base select-none font-medium block px-4 py-2 focus:outline-none cursor-pointer transition',
              isFocused && 'bg-gray-100',
            )}
            href={item.props.href}
            aria-current={item.props['aria-current']}
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
        'text-base select-none font-medium block px-4 py-2 focus:outline-none cursor-pointer transition',
        isFocused && 'bg-gray-100',
      )}
    >
      {item.rendered}
    </li>
  )
}
