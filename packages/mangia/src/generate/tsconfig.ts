import { relative, resolve, join } from 'pathe'

export function generateBaseTsConfig(
  rootDir: string,
  buildDir: string,
  aliases: Record<string, string>,
  strict: boolean,
): string {
  const paths: Record<string, string[]> = {}
  for (const [alias, target] of Object.entries(aliases)) {
    const relTarget = relative(buildDir, target) || '.'
    if (alias.endsWith('/*')) {
      paths[alias] = [`${relTarget}/*`]
    } else {
      paths[alias] = [relTarget]
    }
  }

  const config = {
    compilerOptions: {
      strict,
      noImplicitOverride: true,
      noPropertyAccessFromIndexSignature: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      skipLibCheck: true,
      isolatedModules: true,
      experimentalDecorators: true,
      importHelpers: true,
      target: 'ES2022',
      module: 'preserve',
      baseUrl: '.',
      rootDir: relative(buildDir, rootDir) || '.',
      paths,
    },
    angularCompilerOptions: {
      enableI18nLegacyMessageIdFormat: false,
      strictInjectionParameters: true,
      strictInputAccessModifiers: true,
      strictTemplates: true,
    },
  }

  return JSON.stringify(config, null, 2) + '\n'
}

export function generateAppTsConfig(
  buildDir: string,
  rootDir: string,
  srcDir: string,
): string {
  const relSrcDir = relative(buildDir, resolve(rootDir, srcDir))

  const config = {
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: relative(buildDir, resolve(rootDir, 'out-tsc/app')),
      types: ['node'],
    },
    include: [`${relSrcDir}/**/*.ts`],
    exclude: [`${relSrcDir}/**/*.spec.ts`],
  }

  return JSON.stringify(config, null, 2) + '\n'
}
