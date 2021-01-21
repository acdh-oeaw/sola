import { useTextField } from '@react-aria/textfield'
import type { AriaTextFieldProps } from '@react-types/textfield'
import cx from 'clsx'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useRef } from 'react'

import { Label } from '@/modules/ui/Label'

export interface TextFieldProps extends AriaTextFieldProps {
  label: ReactNode
  className?: string
}

export function TextField({
  className,
  ...props
}: TextFieldProps): JSX.Element {
  const { label } = props
  const ref = useRef<HTMLInputElement>(null)
  const { labelProps, inputProps } = useTextField(props, ref)

  return (
    <div className="flex flex-col space-y-1">
      <Label {...labelProps}>{label}</Label>
      <input
        type="text"
        className={cx('px-2 py-1 text-sm rounded', className)}
        {...(inputProps as InputHTMLAttributes<HTMLInputElement>)}
        ref={ref}
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  )
}
