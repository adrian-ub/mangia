import type { MangiaConfig, MangiaHooks } from '@mangia/schema'
import type { Hookable } from 'hookable'
import type { Plugin } from './types'
import process from 'node:process'
import { installModules, installModulesFromLayers, loadMangiaConfig } from '@mangia/kit'
import { createHooks } from 'hookable'
import { buildPlugins } from './builder'

export interface CreateMangiaOptions {
  rootDir?: string
  overrides?: Partial<MangiaConfig>
}

export interface MangiaInstance {
  config: MangiaConfig
  hooks: Hookable<MangiaHooks>
  plugins: Plugin[]
  close: () => Promise<void>
}

export async function createMangia(options: CreateMangiaOptions = {}): Promise<MangiaInstance> {
  const rootDir = options.rootDir ?? process.cwd()

  const config = await loadMangiaConfig({
    rootDir,
    overrides: options.overrides,
  })

  const hooks = createHooks<MangiaHooks>()

  await installModulesFromLayers(config, hooks, rootDir)
  await installModules(config, hooks, rootDir)

  const plugins = await buildPlugins(config, hooks, rootDir)

  return {
    config,
    hooks,
    plugins,
    async close() {
      await hooks.callHook('build:done', config)
    },
  }
}
