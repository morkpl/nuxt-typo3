import { cp, readdir, rm } from 'node:fs/promises'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  hooks: {
    'rollup:done': async function () {
      // temporary solution when creating a fix in `mkdist` (relative module extensions are not correct when referring externally)
      for (const file of await readdir('dist')) {
        if (file.endsWith('.mjs') || file.endsWith('.d.mts')) {
          await cp(`dist/${file}`, `dist/${file.replace('.mjs', '.js').replace('.d.mts', '.d.ts')}`)
          await rm(`dist/${file}`)
        }
      }
    },
  },
})
