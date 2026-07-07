import type { MangiaConfig, MangiaConfigLayer } from '@mangia/schema'
import process from 'node:process'
import { loadConfig } from 'c12'
import { defu } from 'defu'
import { resolve } from 'pathe'
import { glob } from 'tinyglobby'

export interface LoadMangiaConfigOptions {
  rootDir?: string
  overrides?: Partial<MangiaConfig>
  defaults?: Partial<MangiaConfig>
}

const DEFAULT_CONFIG: Partial<MangiaConfig> = {
  srcDir: 'app',
}

export async function loadMangiaConfig(options: LoadMangiaConfigOptions = {}): Promise<MangiaConfig> {
  const rootDir = options.rootDir ?? process.cwd()

  const localLayerDirs = await glob('layers/*', { onlyDirectories: true, cwd: rootDir })
  const localLayers = localLayerDirs
    .map(d => `${d}/`)
    .sort((a, b) => b.localeCompare(a))

  const { config, layers: rawLayers } = await loadConfig<MangiaConfig>({
    name: 'mangia',
    cwd: rootDir,
    overrides: defu(options.overrides ?? {}, { _extends: localLayers } as any),
    defaults: defu(options.defaults ?? {}, DEFAULT_CONFIG),
    extend: { extendKey: ['extends', '_extends'] },
  })

  const resolvedLayers: MangiaConfigLayer[] = []
  const processedDirs = new Set<string>()

  if (rawLayers) {
    for (const raw of rawLayers) {
      const cwd = resolve(rootDir, raw.cwd || rootDir)
      if (!cwd || processedDirs.has(cwd))
        continue
      processedDirs.add(cwd)

      if (cwd === rootDir)
        continue

      resolvedLayers.push({
        config: (raw.config ?? {}) as MangiaConfig,
        cwd,
        configFile: raw.configFile,
        meta: raw.meta as { name?: string } | undefined,
      })
    }
  }

  config!._layers = [
    {
      config: config!,
      cwd: rootDir,
    },
    ...resolvedLayers,
  ]

  return config!
}
