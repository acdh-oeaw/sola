import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'

import { Clear } from '../icons/Clear'

const labels = {
  en: {
    clear: 'Clear',
  },
  de: {
    clear: 'Entfernen',
  },
}

export interface ClearButtonProps {
  'aria-label'?: string
  className?: string
  onClick: () => void
}

export function ClearButton(props: ClearButtonProps): JSX.Element {
  const locale = useCurrentLocale()

  return (
    <button aria-label={labels[locale].clear} {...props}>
      <Clear />
    </button>
  )
}
