import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'pathe'
import type { Hookable } from 'hookable'
import type { MangiaConfig, MangiaHooks } from '@mangia/schema'
import type { Plugin } from '../types'
import { generateEntryClient, generateEntryServer, generateSSREntry } from '../generate/entries'
import { generateAppConfig, generateAppConfigServer } from '../generate/virtual'
import { generateBaseTsConfig, generateAppTsConfig } from '../generate/tsconfig'

const VIRTUAL_APP_CONFIG = 'virtual:mangia/app-config'
const RESOLVED_APP_CONFIG = '\0mangia:app-config'
const VIRTUAL_APP_CONFIG_SERVER = 'virtual:mangia/app-config-server'
const RESOLVED_APP_CONFIG_SERVER = '\0mangia:app-config-server'

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

  return {
    name: 'mangia',
    enforce: 'pre',

    config(userConfig: any) {
      mkdirSync(buildDir, { recursive: true })

      writeFileSync(
        join(buildDir, 'entry-client.ts'),
        generateEntryClient(appComponent, cssFiles, rootDir, srcDir, buildDir),
      )
      writeFileSync(
        join(buildDir, 'entry-server.ts'),
        generateSSREntry(),
      )
      writeFileSync(
        join(buildDir, 'entry-server-handler.ts'),
        generateEntryServer(appComponent, cssFiles, rootDir, srcDir, buildDir, config.app?.head),
      )

      const aliases: Record<string, string> = {
        '~': srcDirResolved,
        '~~': rootDir,
        '#build': buildDir,
      }
      const strict = config.typescript?.strict ?? true
      writeFileSync(join(buildDir, 'tsconfig.json'), generateBaseTsConfig(rootDir, buildDir, aliases, strict))
      writeFileSync(join(buildDir, 'tsconfig.app.json'), generateAppTsConfig(buildDir, rootDir, srcDir))

      return {
        resolve: {
          alias: {
            '~': srcDirResolved,
            '~~': rootDir,
            '#build': buildDir,
          },
        },
        environments: {
          client: {
            build: {
              rollupOptions: {
                input: join(buildDir, 'entry-client.ts'),
              },
            },
          },
          ssr: {
            build: {
              rollupOptions: {
                input: join(buildDir, 'entry-server.ts'),
              },
            },
          },
        },
      }
    },

    resolveId(id: string) {
      if (id === VIRTUAL_APP_CONFIG) return RESOLVED_APP_CONFIG
      if (id === VIRTUAL_APP_CONFIG_SERVER) return RESOLVED_APP_CONFIG_SERVER
    },

    load(id: string) {
      if (id === RESOLVED_APP_CONFIG) return generateAppConfig(rootDir, srcDir)
      if (id === RESOLVED_APP_CONFIG_SERVER) return generateAppConfigServer()
    },
  }
}
