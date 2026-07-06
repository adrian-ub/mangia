import { resolve, basename } from 'pathe'
import type { MangiaConfig, MangiaConfigLayer } from '@mangia/schema'

export interface MangiaLayerDirectories {
  root: string
  srcDir: string
  name: string
  server: string
  shared: string
  app: string
  appPages: string
  appLayouts: string
  appError: string
}

export function getLayerDirectories(
  config: MangiaConfig,
  rootDir: string,
): MangiaLayerDirectories[] {
  const layers: MangiaConfigLayer[] = config._layers ?? []

  return layers.map((layer) => {
    const isRoot = layer.cwd === rootDir
    const layerConfig = isRoot ? config : layer.config
    const srcDir = resolve(layer.cwd, layerConfig.srcDir ?? 'app')
    const name = layer.meta?.name ?? (isRoot ? '' : basename(layer.cwd))

    return {
      root: layer.cwd,
      srcDir,
      name,
      server: resolve(layer.cwd, 'server'),
      shared: resolve(layer.cwd, 'shared'),
      app: srcDir,
      appPages: resolve(srcDir, 'pages'),
      appLayouts: resolve(srcDir, 'layouts'),
      appError: resolve(srcDir, 'error.ts'),
    }
  })
}
