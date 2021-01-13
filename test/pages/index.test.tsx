import IndexPage, { labels } from '@/pages/index'
import { render } from '~/test/render'

describe('IndexPage', () => {
  it('should render static content', async () => {
    const props = { labels: labels['en'] }

    const { getByText } = render(<IndexPage {...props} />, {
      router: { pathname: '/', asPath: '/' },
    })

    expect(getByText('Home')).toBeInTheDocument()
  })
})
