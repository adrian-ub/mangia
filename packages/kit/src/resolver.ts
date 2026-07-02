import { resolve } from 'pathe'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'

export interface Resolver {
  resolve: (...path: string[]) => string
  resolveModule: (id: string) => string
  exists: (...path: string[]) => boolean
}

export function createResolver(basePath: string): Resolver {
  const _require = createRequire(import.meta.url)

  return {
    resolve(...path: string[]) {
      return resolve(basePath, ...path)
    },
    resolveModule(id: string) {
      return _require.resolve(id, { paths: [basePath] })
    },
    exists(...path: string[]) {
      return existsSync(resolve(basePath, ...path))
    },
  }
}
