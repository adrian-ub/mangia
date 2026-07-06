import { existsSync } from 'node:fs'
import { resolve } from 'pathe'

export function generateAppConfig(rootDir: string, srcDir: string): string {
  const srcAppConfigPath = resolve(rootDir, srcDir, 'app.config.ts')
  const hasUserConfig = existsSync(srcAppConfigPath)

  if (hasUserConfig) {
    return [
      "import { mergeApplicationConfig } from '@angular/core';",
      "import { provideRouter } from '@angular/router';",
      "import { provideHttpClient, withFetch } from '@angular/common/http';",
      "import { provideClientHydration } from '@angular/platform-browser';",
      "import { routes } from 'virtual:mangia/pages';",
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
    ].join('\n')
  }

  return [
    "import { provideRouter } from '@angular/router';",
    "import { provideHttpClient, withFetch } from '@angular/common/http';",
    "import { provideClientHydration } from '@angular/platform-browser';",
    "import { routes } from 'virtual:mangia/pages';",
    '',
    'export const appConfig = {',
    '  providers: [',
    '    provideRouter(routes),',
    '    provideHttpClient(withFetch()),',
    '    provideClientHydration(),',
    '  ],',
    '};',
  ].join('\n')
}

export function generateAppConfigServer(): string {
  return [
    "import { mergeApplicationConfig } from '@angular/core';",
    "import { provideServerRendering } from '@angular/ssr';",
    "import { appConfig } from 'virtual:mangia/app-config';",
    '',
    'const serverConfig = {',
    '  providers: [',
    '    provideServerRendering(),',
    '  ],',
    '};',
    '',
    'export const config = mergeApplicationConfig(appConfig, serverConfig);',
  ].join('\n')
}
