import type { MangiaConfigLayer } from '@mangia/schema'
import { basename, relative, resolve } from 'pathe'

function rel(buildDir: string, target: string): string {
  return relative(buildDir, target) || '.'
}

function layerIncludeGlob(buildDir: string, rootDir: string, subpath: string): string {
  const rootRel = rel(buildDir, rootDir)
  return `${rootRel}/layers/*/${subpath}`
}

export function generateRootTsConfig(_buildDir: string): string {
  return `${JSON.stringify({
    files: [],
    references: [
      { path: './tsconfig.app.json' },
      { path: './tsconfig.node.json' },
      { path: './tsconfig.server.json' },
      { path: './tsconfig.shared.json' },
    ],
  }, null, 2)}\n`
}

export function generateAppTsConfig(
  buildDir: string,
  rootDir: string,
  srcDir: string,
  aliases: Record<string, string>,
  strict: boolean,
  layers: MangiaConfigLayer[] = [],
): string {
  const paths: Record<string, string[]> = {}
  for (const [alias, target] of Object.entries(aliases)) {
    const r = rel(buildDir, target)
    if (alias.endsWith('/*')) {
      paths[alias] = [`${r}/*`]
    }
    else {
      paths[alias] = [r]
    }
  }

  for (const layer of layers) {
    if (layer.cwd === rootDir)
      continue
    const name = layer.meta?.name ?? basename(layer.cwd)
    if (name) {
      const layerRoot = rel(buildDir, resolve(layer.cwd))
      paths[`#layers/${name}`] = [layerRoot]
      paths[`#layers/${name}/*`] = [`${layerRoot}/*`]
    }
  }

  return `${JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      strict,
      noImplicitOverride: true,
      noPropertyAccessFromIndexSignature: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      experimentalDecorators: true,
      importHelpers: true,
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022', 'DOM'],
      types: ['node'],
      paths,
      outDir: rel(buildDir, resolve(rootDir, 'out-tsc/app')),
    },
    angularCompilerOptions: {
      enableI18nLegacyMessageIdFormat: false,
      strictInjectionParameters: true,
      strictInputAccessModifiers: true,
      strictTemplates: true,
    },
    include: [
      `${rel(buildDir, resolve(rootDir, srcDir))}/**/*.ts`,
      `${rel(buildDir, resolve(rootDir, srcDir))}/**/*.d.ts`,
      `${layerIncludeGlob(buildDir, rootDir, 'app/**/*.ts')}`,
      `${layerIncludeGlob(buildDir, rootDir, 'app/**/*.d.ts')}`,
      `${rel(buildDir, resolve(rootDir, 'layers/*'))}/*.d.ts`,
    ],
    exclude: [
      `${rel(buildDir, resolve(rootDir, srcDir))}/**/*.spec.ts`,
    ],
  }, null, 2)}\n`
}

export function generateNodeTsConfig(
  buildDir: string,
  rootDir: string,
  _layers: MangiaConfigLayer[] = [],
): string {
  return `${JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022'],
      types: ['node'],
    },
    include: [
      rel(buildDir, resolve(rootDir, 'mangia.config.ts')),
      `${rel(buildDir, resolve(rootDir, 'modules'))}/**/*.ts`,
      `${layerIncludeGlob(buildDir, rootDir, 'mangia.config.*')}`,
      `${layerIncludeGlob(buildDir, rootDir, 'modules/**/*.ts')}`,
    ],
  }, null, 2)}\n`
}

export function generateServerTsConfig(
  buildDir: string,
  rootDir: string,
  _layers: MangiaConfigLayer[] = [],
): string {
  return `${JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022'],
      types: ['node'],
    },
    include: [
      `${rel(buildDir, resolve(rootDir, 'server'))}/**/*.ts`,
      `${layerIncludeGlob(buildDir, rootDir, 'server/**/*.ts')}`,
    ],
  }, null, 2)}\n`
}

export function generateSharedTsConfig(
  buildDir: string,
  rootDir: string,
  _layers: MangiaConfigLayer[] = [],
): string {
  return `${JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022'],
    },
    include: [
      `${rel(buildDir, resolve(rootDir, 'shared'))}/**/*.ts`,
      `${layerIncludeGlob(buildDir, rootDir, 'shared/**/*.ts')}`,
    ],
  }, null, 2)}\n`
}
