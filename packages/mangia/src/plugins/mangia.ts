import type { MangiaConfig, MangiaConfigLayer, MangiaHooks } from '@mangia/schema'
import type { Hookable } from 'hookable'
import type { Plugin } from '../types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { basename, join, resolve } from 'pathe'
import {
  generateAppDeclarations,
  generateNodeDeclarations,
  generateServerDeclarations,
  generateSharedDeclarations,
} from '../generate/declarations'
import {
  generateAppTsConfig,
  generateNodeTsConfig,
  generateRootTsConfig,
  generateServerTsConfig,
  generateSharedTsConfig,
} from '../generate/tsconfig'
import { generateAppConfig, generateRootComponent } from '../generate/virtual'

const VIRTUAL_APP_CONFIG = 'virtual:mangia/app-config'
const RESOLVED_APP_CONFIG = '\0mangia:app-config'
const VIRTUAL_ROOT_COMPONENT = 'virtual:mangia/root-component'
const RESOLVED_ROOT_COMPONENT = '\0mangia:root-component'

const ANGULAR_VIRTUALS: Record<string, string> = {
  'virtual:mangia/ng-platform-browser': `export { bootstrapApplication } from '@angular/platform-browser';`,
  'virtual:mangia/ng-core': `export { reflectComponentType, mergeApplicationConfig } from '@angular/core';`,
  'virtual:mangia/ng-compiler': `export { publishFacade } from '@angular/compiler';`,
  'virtual:mangia/ng-platform-server': `export { renderApplication, ɵSERVER_CONTEXT } from '@angular/platform-server';`,
  'virtual:mangia/ng-ssr': `export { provideServerRendering } from '@angular/ssr';`,
}
const RESOLVED_ANGULAR_VIRTUALS = Object.fromEntries(
  Object.keys(ANGULAR_VIRTUALS).map(k => [k, k.replace('virtual:', '\0')]),
)

const _entryDir = fileURLToPath(new URL('../src/app/', import.meta.url))

function collectLayerNames(layers: MangiaConfigLayer[], rootDir: string): string[] {
  return layers
    .filter(l => l.cwd !== rootDir)
    .map(l => l.meta?.name ?? basename(l.cwd))
    .filter(Boolean)
}

export function mangiaPlugin(
  config: MangiaConfig,
  hooks: Hookable<MangiaHooks>,
  rootDir: string,
): Plugin {
  const srcDir = config.srcDir ?? 'app'
  const srcDirResolved = resolve(rootDir, srcDir)
  const buildDir = resolve(rootDir, '.mangia')
  const appComponent = `${srcDir}/app`
  const cssFiles = config.css ?? []
  const strict = config.typescript?.strict ?? true
  const layers = config._layers ?? []

  return {
    name: 'mangia',
    enforce: 'pre',

    config(_userConfig: any) {
      mkdirSync(buildDir, { recursive: true })
      mkdirSync(join(buildDir, 'types'), { recursive: true })

      const aliases: Record<string, string> = {
        '~': srcDirResolved,
        '~~': rootDir,
        '#build': buildDir,
      }

      for (const layer of layers) {
        if (layer.cwd === rootDir)
          continue
        const name = layer.meta?.name ?? basename(layer.cwd)
        if (name) {
          aliases[`#layers/${name}`] = layer.cwd
        }
      }

      writeFileSync(join(buildDir, 'tsconfig.json'), generateRootTsConfig(buildDir))
      writeFileSync(join(buildDir, 'tsconfig.app.json'), generateAppTsConfig(buildDir, rootDir, srcDir, aliases, strict, layers))
      writeFileSync(join(buildDir, 'tsconfig.node.json'), generateNodeTsConfig(buildDir, rootDir, layers))
      writeFileSync(join(buildDir, 'tsconfig.server.json'), generateServerTsConfig(buildDir, rootDir, layers))
      writeFileSync(join(buildDir, 'tsconfig.shared.json'), generateSharedTsConfig(buildDir, rootDir, layers))

      const layerNames = collectLayerNames(layers, rootDir)
      writeFileSync(join(buildDir, 'types', 'app.d.ts'), generateAppDeclarations(layerNames))
      writeFileSync(join(buildDir, 'types', 'node.d.ts'), generateNodeDeclarations())
      writeFileSync(join(buildDir, 'types', 'server.d.ts'), generateServerDeclarations())
      writeFileSync(join(buildDir, 'types', 'shared.d.ts'), generateSharedDeclarations())

      return {
        resolve: {
          alias: aliases,
        },
        environments: {
          client: {
            build: {
              rollupOptions: {
                input: resolve(_entryDir, 'entry-client.ts'),
              },
            },
          },
          ssr: {
            build: {
              rollupOptions: {
                input: resolve(_entryDir, 'entry-server.ts'),
              },
            },
          },
        },
      }
    },

    resolveId(id: string) {
      if (id === VIRTUAL_APP_CONFIG)
        return RESOLVED_APP_CONFIG
      if (id === VIRTUAL_ROOT_COMPONENT)
        return RESOLVED_ROOT_COMPONENT
      if (id in RESOLVED_ANGULAR_VIRTUALS)
        return RESOLVED_ANGULAR_VIRTUALS[id]
    },

    load(id: string) {
      if (id === RESOLVED_APP_CONFIG)
        return generateAppConfig(rootDir, srcDir, config.app?.head)
      if (id === RESOLVED_ROOT_COMPONENT)
        return generateRootComponent(appComponent, cssFiles, rootDir, srcDir, buildDir)
      for (const [virtual, resolved] of Object.entries(RESOLVED_ANGULAR_VIRTUALS)) {
        if (id === resolved)
          return ANGULAR_VIRTUALS[virtual]
      }
    },
  }
}
