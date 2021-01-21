import generate from '@stefanprobst/favicons'

import { log } from '@/lib/util/log'
import metadata from '~/config/metadata.json'

Promise.all(
  Object.entries(metadata).map(
    ([locale, { image, shortTitle, title }], index) =>
      generate({
        inputFilePath: image.src,
        outputFolder: index === 0 ? 'public' : `public/${locale}`,
        name: title,
        shortName: shortTitle,
        maskable: true,
        color: '#fff',
      }),
  ),
)
  .then(() => log.success('Successfully generated favicons.'))
  .catch(log.error)
