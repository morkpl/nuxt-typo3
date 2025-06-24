import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './src/module'
  ],
  declaration: 'compatible', // .d.ts and .d.mts
  rollup: {
    emitCJS: true, // .cjs
  },
})
