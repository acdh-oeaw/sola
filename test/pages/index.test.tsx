import IndexPage from '@/pages/index'
import { render } from '~/test/render'

describe('IndexPage', () => {
  it('should render static content', async () => {
    const { getByText } = render(<IndexPage />, {
      router: { pathname: '/', asPath: '/' },
    })

    expect(getByText('Home')).toBeInTheDocument()
  })
})
