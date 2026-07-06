import { resolve } from 'pathe'
import { createRequire } from 'node:module'
import { existsSync, statSync, readFileSync } from 'node:fs'
import { defu } from 'defu'
import type { Hookable } from 'hookable'
import type { MangiaModule, MangiaModuleContext, MangiaConfig, MangiaHooks, MangiaPage, MangiaModuleMeta } from '@mangia/schema'

export interface MangiaModuleDefinition {
  meta?: MangiaModuleMeta
  defaults?: Partial<MangiaConfig>
  hooks?: Partial<MangiaHooks>
  setup: (this: MangiaModuleContext, context: MangiaModuleContext) => void | Promise<void>
}

export function defineMangiaModule(def: MangiaModuleDefinition): MangiaModule {
  return {
    meta: def.meta,
    defaults: def.defaults,
    hooks: def.hooks,
    setup(context) {
      return def.setup.call(context, context)
    },
  }
}

export async function installModules(
  config: MangiaConfig,
  hooks: Hookable<MangiaHooks>,
  rootDir: string,
): Promise<void> {
  await installModulesFromConfig(config, hooks, rootDir)
}

export async function installModulesFromLayers(
  config: MangiaConfig,
  hooks: Hookable<MangiaHooks>,
  rootDir: string,
): Promise<void> {
  const layers = config._layers ?? []

  for (const layer of layers) {
    const cwd = layer.cwd
    if (cwd === rootDir) continue

    const mods = layer.config.modules ?? []
    if (mods.length === 0) continue

    const layerConfig = { ...config, ...layer.config, modules: mods }
    await installModulesFromConfig(layerConfig, hooks, cwd)
  }
}

async function installModulesFromConfig(
  config: MangiaConfig,
  hooks: Hookable<MangiaHooks>,
  rootDir: string,
): Promise<void> {
  const entries = config.modules ?? []
  const _require = createRequire(resolve(rootDir, 'package.json'))

  for (const entry of entries) {
    let mod: MangiaModule

    if (typeof entry === 'string') {
      const resolved = resolveModulePath(entry, rootDir, _require)
      mod = (await import(resolved) as { default: MangiaModule }).default
    } else {
      mod = entry
    }

    if (mod.defaults) {
      Object.assign(config, defu(config, mod.defaults))
    }

    const addedPlugins: string[] = []
    const extendPagesCbs: Array<(pages: MangiaPage[]) => void> = []

    const ctx: MangiaModuleContext = {
      options: config,
      addPlugin(plugin) {
        const src = typeof plugin === 'string' ? plugin : plugin.src
        addedPlugins.push(src)
      },
      extendPages(cb) {
        extendPagesCbs.push(cb)
      },
      addHooks(moduleHooks) {
        hooks.addHooks(moduleHooks as any)
      },
    }

    if (mod.hooks) {
      hooks.addHooks(mod.hooks as any)
    }

    await mod.setup(ctx)

    for (const cb of extendPagesCbs) {
      hooks.hook('pages:extend', cb)
    }
  }
}

function resolveModulePath(entry: string, rootDir: string, _require: NodeJS.Require): string {
  let resolved: string
  if (entry.startsWith('~')) {
    const localPath = entry.replace(/^~\/?/, '')
    resolved = resolve(rootDir, localPath)
  } else if (entry.startsWith('.') || entry.startsWith('/')) {
    resolved = resolve(rootDir, entry)
  } else {
    resolved = _require.resolve(entry, { paths: [rootDir] })
  }
  if (existsSync(resolved) && statSync(resolved).isDirectory()) {
    const indexTs = resolve(resolved, 'index.ts')
    const indexMjs = resolve(resolved, 'index.mjs')
    if (existsSync(indexTs)) return indexTs
    if (existsSync(indexMjs)) return indexMjs
    const pkg = resolve(resolved, 'package.json')
    if (existsSync(pkg)) {
      const { main, exports } = JSON.parse(readFileSync(pkg, 'utf-8'))
      if (exports?.['.']?.import) return resolve(resolved, exports['.'].import)
      if (exports?.['.']?.default) return resolve(resolved, exports['.'].default)
      if (main) return resolve(resolved, main)
    }
  }
  return resolved
}
