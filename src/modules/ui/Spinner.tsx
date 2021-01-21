import { useProgressBar } from '@react-aria/progress'
import type { SVGProps } from 'react'

import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'

const labels = {
  en: {
    loading: 'Loading...',
  },
  de: {
    loading: 'Laden...',
  },
}

export interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps): JSX.Element {
  const locale = useCurrentLocale()

  const { progressBarProps } = useProgressBar({
    isIndeterminate: true,
    'aria-label': labels[locale].loading,
  })

  const center = 16
  const strokeWidth = 4
  const r = 16 - strokeWidth
  const c = 2 * r * Math.PI
  const offset = c - (1 / 4) * c

  return (
    <svg
      {...(progressBarProps as SVGProps<SVGSVGElement>)}
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      fill="none"
      strokeWidth={strokeWidth}
      className={className}
    >
      <circle
        role="presentation"
        cx={center}
        cy={center}
        r={r}
        stroke="currentColor"
        opacity="0.25"
      />
      <circle
        role="presentation"
        cx={center}
        cy={center}
        r={r}
        stroke="currentColor"
        strokeDasharray={c}
        strokeDashoffset={offset}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          begin="0s"
          dur="1s"
          from="0 16 16"
          to="360 16 16"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}
