import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

type Labels = Record<string, unknown>

const LabelsContext = createContext<Labels | null>(null)

export function useLabels(): Labels {
  const labels = useContext(LabelsContext)

  if (labels === null) {
    throw new Error('`useLabels` must be nested inside a `LabelsProvider`.')
  }

  return labels
}

export interface LabelsProviderProps {
  children?: ReactNode
  labels: Labels
}

export function LabelsProvider({
  children,
  labels,
}: LabelsProviderProps): JSX.Element {
  return (
    <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>
  )
}
