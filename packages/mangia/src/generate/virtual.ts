import { existsSync } from 'node:fs'
import { relative, resolve } from 'pathe'
import type { MangiaHead } from '@mangia/schema'

export function generateAppConfig(rootDir: string, srcDir: string, head?: MangiaHead): string {
  const srcAppConfigPath = resolve(rootDir, srcDir, 'app.config.ts')
  const hasUserConfig = existsSync(srcAppConfigPath)

  const withHead = (code: string) => {
    const headJson = JSON.stringify(head ?? {})
    return code + `\n\nexport const head = ${headJson};`
  }

  if (hasUserConfig) {
    return withHead([
      "import { mergeApplicationConfig } from '@angular/core';",
      "import { provideRouter } from '@angular/router';",
      "import { provideHttpClient, withFetch } from '@angular/common/http';",
      "import { provideClientHydration } from '@angular/platform-browser';",
      "import { routes } from 'virtual:mangia/pages.ts';",
      `import { default as userConfig } from '/${srcDir}/app.config';`,
      '',
      'const defaultConfig = {',
      '  providers: [',
      '    provideRouter(routes),',
      '    provideHttpClient(withFetch()),',
      '    provideClientHydration(),',
      '  ],',
      '};',
      '',
      'const { providers: extraProviders = [] } = userConfig || {};',
      '',
      'export const appConfig = mergeApplicationConfig(defaultConfig, {',
      '  providers: extraProviders,',
      '});',
    ].join('\n'))
  }

  return withHead([
    "import { provideRouter } from '@angular/router';",
    "import { provideHttpClient, withFetch } from '@angular/common/http';",
    "import { provideClientHydration } from '@angular/platform-browser';",
    "import { routes } from 'virtual:mangia/pages.ts';",
    '',
    'export const appConfig = {',
    '  providers: [',
    '    provideRouter(routes),',
    '    provideHttpClient(withFetch()),',
    '    provideClientHydration(),',
    '  ],',
    '};',
  ].join('\n'))
}

export function generateRootComponent(
  appComponent: string,
  css: string[],
  rootDir: string,
  srcDir: string,
  buildDir: string,
): string {
  const cssImports = css.map(f => `import '${relative(buildDir, resolve(rootDir, f.replace(/^~\//, srcDir + '/')))}';`).join('\n')

  return [
    `import * as __module from '/${appComponent}';`,
    cssImports,
    '',
    'const __rootComponent = __module.default ?? __module.App;',
    'export { __rootComponent };',
  ].join('\n')
}
