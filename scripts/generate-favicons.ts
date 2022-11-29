import generate from '@stefanprobst/favicons'
import { log } from '@stefanprobst/log'

import metadata from '../config/metadata.json' assert { type: 'json' }

Promise.all(
  Object.entries(metadata).map(([locale, { favicon, shortTitle, title }], index) => {
    return generate({
      inputFilePath: favicon.src,
      outputFolder: index === 0 ? 'public' : `public/${locale}`,
      name: title,
      shortName: shortTitle,
      maskable: true,
      color: '#fff',
    })
  }),
)
  .then(() => {
    log.success('Successfully generated favicons.')
  })
  .catch((error) => {
    log.error('Failed to generate favicons.\n', String(error))
  })
