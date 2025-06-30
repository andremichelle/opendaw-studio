import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [
    // Only exclude external npm packages, bundle everything else
    '@types/audioworklet'
  ],
  noExternal: [
    // Bundle all internal packages
    'lib-std',
    'lib-dsp', 
    'lib-box',
    'lib-runtime',
    'lib-fusion',
    'studio-enums',
    'studio-boxes',
    'studio-adapters',
    'studio-worklet'
  ]
}) 