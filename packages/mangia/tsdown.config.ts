import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    config: './src/config.ts',
    unhead: './src/unhead/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
})
