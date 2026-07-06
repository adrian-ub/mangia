import { relative, resolve } from 'pathe'

function rel(buildDir: string, target: string): string {
  return relative(buildDir, target) || '.'
}

export function generateRootTsConfig(buildDir: string): string {
  return JSON.stringify({
    files: [],
    references: [
      { path: './tsconfig.app.json' },
      { path: './tsconfig.node.json' },
      { path: './tsconfig.server.json' },
      { path: './tsconfig.shared.json' },
    ],
  }, null, 2) + '\n'
}

export function generateAppTsConfig(
  buildDir: string,
  rootDir: string,
  srcDir: string,
  aliases: Record<string, string>,
  strict: boolean,
): string {
  const paths: Record<string, string[]> = {}
  for (const [alias, target] of Object.entries(aliases)) {
    const r = rel(buildDir, target)
    if (alias.endsWith('/*')) {
      paths[alias] = [`${r}/*`]
    } else {
      paths[alias] = [r]
    }
  }

  return JSON.stringify({
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
      baseUrl: '.',
      rootDir: rel(buildDir, rootDir),
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
    ],
    exclude: [
      `${rel(buildDir, resolve(rootDir, srcDir))}/**/*.spec.ts`,
    ],
  }, null, 2) + '\n'
}

export function generateNodeTsConfig(buildDir: string, rootDir: string): string {
  return JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022'],
      types: ['node'],
      baseUrl: '.',
      rootDir: rel(buildDir, rootDir),
    },
    include: [
      rel(buildDir, resolve(rootDir, 'mangia.config.ts')),
      `${rel(buildDir, resolve(rootDir, 'modules'))}/**/*.ts`,
    ],
  }, null, 2) + '\n'
}

export function generateServerTsConfig(buildDir: string, rootDir: string): string {
  return JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022'],
      types: ['node'],
      baseUrl: '.',
      rootDir: rel(buildDir, rootDir),
    },
    include: [
      `${rel(buildDir, resolve(rootDir, 'server'))}/**/*.ts`,
    ],
  }, null, 2) + '\n'
}

export function generateSharedTsConfig(buildDir: string, rootDir: string): string {
  return JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'preserve',
      moduleResolution: 'Bundler',
      skipLibCheck: true,
      isolatedModules: true,
      lib: ['ES2022'],
      baseUrl: '.',
      rootDir: rel(buildDir, rootDir),
    },
    include: [
      `${rel(buildDir, resolve(rootDir, 'shared'))}/**/*.ts`,
    ],
  }, null, 2) + '\n'
}
