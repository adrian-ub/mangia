import type { MangiaConfig, MangiaHooks } from '@mangia/schema'
import type { Hookable } from 'hookable'
import type { Plugin } from './types'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { getLayerDirectories } from '@mangia/kit'
import { resolve } from 'pathe'
import { mangiaPlugin } from './plugins/mangia'
import { pagesPlugin } from './plugins/pages'

export async function buildPlugins(
  config: MangiaConfig,
  hooks: Hookable<MangiaHooks>,
  rootDir: string,
): Promise<Plugin[]> {
  await hooks.callHook('build:before', config)

  const plugins: Plugin[] = []

  plugins.push(mangiaPlugin(config, hooks, rootDir))

  plugins.push(pagesPlugin(config.srcDir ?? 'app', hooks, rootDir, config))

  try {
    const { nitro } = await loadFromUser<typeof import('nitro/vite')>(rootDir, 'nitro/vite')
    const nitroConfig = config.nitro ? { ...config.nitro } : {}

    const scanDirs = [resolve(rootDir, 'server')]
    for (const dir of getLayerDirectories(config, rootDir)) {
      if (existsSync(dir.server)) {
        scanDirs.push(dir.server)
      }
    }
    nitroConfig.scanDirs = [...new Set([...((nitroConfig.scanDirs ?? []) as string[]), ...scanDirs])]

    nitroConfig.framework = { previewCommand: 'mangia preview' }
    if (nitroConfig.prerender) {
      nitroConfig.prerender = { ...nitroConfig.prerender, routes: [] }
    }
    await hooks.callHook('nitro:config', nitroConfig)
    plugins.push(...(nitro(nitroConfig) as Plugin[]))
  }
  catch {
    console.warn('[mangia] Nitro plugin not found — skipping')
  }

  const buildDir = resolve(rootDir, '.mangia')
  try {
    const angularModule = await loadFromUser<typeof import('@oxc-angular/vite')>(rootDir, '@oxc-angular/vite')
    const oxcAngular = angularModule.angular ?? angularModule.default
    if (oxcAngular) {
      const angularPlugins = oxcAngular({
        tsconfig: resolve(buildDir, 'tsconfig.app.json'),
      })
      plugins.push(...(angularPlugins as Plugin[]))
    }
  }
  catch {
    console.warn('[mangia] @oxc-angular/vite not found — skipping')
  }

  return plugins
}

async function loadFromUser<T>(rootDir: string, id: string): Promise<T> {
  const _require = createRequire(resolve(rootDir, 'package.json'))
  const resolved = _require.resolve(id)
  return import(resolved) as Promise<T>
}
