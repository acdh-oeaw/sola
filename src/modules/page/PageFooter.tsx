import Link from 'next/link'

import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'

const labels = {
  en: {
    imprint: 'Imprint',
    fwf: 'Austrian Science Fund',
    univie: 'University of Vienna',
    acdh: 'Austrian Centre for Digital Humanities and Cultural Heritage',
  },
  de: {
    imprint: 'Impressum',
    fwf: 'Fonds zur Förderung der wissenschaftlichen Forschung',
    univie: 'Universität Wien',
    acdh: 'Austrian Centre for Digital Humanities and Cultural Heritage',
  },
}

/**
 * Page footer.
 */
export function PageFooter(): JSX.Element {
  const locale = useCurrentLocale()

  return (
    <footer
      className="px-6 py-12 space-y-12 bg-white border-t border-gray-200"
      style={{ gridArea: 'footer' }}
    >
      <ul className="flex items-center justify-center space-x-12 text-xs text-gray-700">
        <li>
          <a
            className="inline-block p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            href="https://www.univie.ac.at"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              className="h-10"
              src="/assets/images/uni-vienna-logo.svg"
              alt={labels[locale].univie}
              loading="lazy"
            />
          </a>
        </li>
        <li>
          <a
            className="inline-block p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            href="https://www.fwf.ac.at"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              className="h-10"
              src="/assets/images/fwf-logo.svg"
              alt={labels[locale].fwf}
              loading="lazy"
            />
          </a>
        </li>
        <li>
          <a
            className="inline-block p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            href="https://acdh.oeaw.ac.at"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              className="h-10"
              src="/assets/images/acdh-logo.svg"
              alt={labels[locale].acdh}
              loading="lazy"
            />
          </a>
        </li>
      </ul>
      <div className="text-xs text-center text-gray-500">
        <span>&copy; {new Date().getFullYear()} | </span>
        <Link href="/imprint">
          <a className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
            {labels[locale].imprint}
          </a>
        </Link>
      </div>
    </footer>
  )
}
