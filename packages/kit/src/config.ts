import { loadConfig } from 'c12'
import { defu } from 'defu'
import type { MangiaConfig } from '@mangia/schema'

export interface LoadMangiaConfigOptions {
  rootDir?: string
  overrides?: Partial<MangiaConfig>
  defaults?: Partial<MangiaConfig>
}

const DEFAULT_CONFIG: Partial<MangiaConfig> = {
  srcDir: 'app',
}

export async function loadMangiaConfig(options: LoadMangiaConfigOptions = {}): Promise<MangiaConfig> {
  const { config } = await loadConfig<MangiaConfig>({
    name: 'mangia',
    cwd: options.rootDir,
    overrides: options.overrides,
    defaults: defu(options.defaults ?? {}, DEFAULT_CONFIG),
  })

  return config!
}
