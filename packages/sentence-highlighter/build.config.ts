import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/highlighter.ts'],
  outDir: 'dist',
  failOnWarn: false,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
