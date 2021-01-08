import { PageFooter } from '@/modules/page/PageFooter'
import { PageHeader } from '@/modules/page/PageHeader'

export interface DefaultPageLayoutProps {
  children: JSX.Element
}

/**
 * Default page layout.
 */
export function DefaultPageLayout(props: DefaultPageLayoutProps): JSX.Element {
  return (
    <div>
      <PageHeader />
      {props.children}
      <PageFooter />
    </div>
  )
}
