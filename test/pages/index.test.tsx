import { getCmsPage } from '@/api/cms'
import type { CmsPageMetadata } from '@/pages/index'
import IndexPage, { labels } from '@/pages/index'
import { render } from '~/test/render'

describe('IndexPage', () => {
  it('should render static content', async () => {
    const locale = 'en'
    const page = await getCmsPage<CmsPageMetadata>('index', locale)
    const props = {
      labels: labels[locale],
      page,
    }

    const { getByText } = render(<IndexPage {...props} />, {
      router: { pathname: '/', asPath: '/' },
    })

    expect(getByText('Sunday Observance in Late Antiquity')).toBeInTheDocument()
  })
})
