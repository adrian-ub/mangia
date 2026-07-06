import { relative, resolve } from 'pathe'
import type { MangiaHead } from '@mangia/schema'

export function generateEntryClient(
  appComponent: string,
  css: string[],
  rootDir: string,
  srcDir: string,
  buildDir: string,
): string {
  const cssImports = css.map(f => `import '${relative(buildDir, resolve(rootDir, f.replace(/^~\//, srcDir + '/')))}';`).join('\n')

  return [
    "import { bootstrapApplication } from '@angular/platform-browser';",
    "import { appConfig } from 'virtual:mangia/app-config';",
    `import * as __module from '/${appComponent}';`,
    cssImports,
    '',
    'const __root = __module.default ?? __module.App;',
    'bootstrapApplication(__root, appConfig)',
    '  .catch((err) => console.error(err));',
  ].join('\n')
}

export function generateSSREntry(): string {
  return [
    'const { publishFacade } = await import("@angular/compiler");',
    'publishFacade(globalThis);',
    'const __handler = await import("./entry-server-handler");',
    'export default __handler.default;',
  ].join('\n')
}

export function generateEntryServer(
  appComponent: string,
  css: string[],
  rootDir: string,
  srcDir: string,
  buildDir: string,
  head: MangiaHead | undefined,
): string {
  const title = head?.title ? escapeHtml(head.title) : ''
  const cssImports = css.map(f => `import '${relative(buildDir, resolve(rootDir, f.replace(/^~\//, srcDir + '/')))}';`).join('\n')

  return [
    "import { reflectComponentType, mergeApplicationConfig } from '@angular/core';",
    "import { bootstrapApplication } from '@angular/platform-browser';",
    '',
    "import { appConfig } from 'virtual:mangia/app-config';",
    `import * as __module from '/${appComponent}';`,
    '',
    "import clientAssets from './entry-client?assets=client';",
    "import serverAssets from './entry-server?assets=ssr';",
    cssImports,
    '',
    'const { renderApplication, ɵSERVER_CONTEXT } = await import("@angular/platform-server");',
    'const { provideServerRendering } = await import("@angular/ssr");',
    '',
    'const __root = __module.default ?? __module.App;',
    'const __selector = reflectComponentType(__root)?.selector ?? \'app-root\';',
    '',
    'const config = mergeApplicationConfig(appConfig, {',
    '  providers: [',
    '    { provide: ɵSERVER_CONTEXT, useValue: \'ssr-mangia\' },',
    '    provideServerRendering(),',
    '  ],',
    '});',
    '',
    'const bootstrap = (context: any) => bootstrapApplication(__root, config, context);',
    '',
    `function htmlTemplate() {`,
    `  const scripts = clientAssets.js.map(a => \`<script src="\${a.href}" type="module"></script>\`).join('');`,
    `  const styles = clientAssets.css.map(a => \`<link rel="stylesheet" href="\${a.href}">\`).join('');`,
    `  return \`<!DOCTYPE html><html><head><title>${title}</title>\${styles}</head><body><\${__selector}></\${__selector}>\${scripts}</body></html>\`;`,
    '}',
    '',
    'export default {',
    '  async fetch(request: Request) {',
    '    const url = new URL(request.url);',
    '    const assets = clientAssets.merge(serverAssets);',
    '    const renderedApp = await renderApplication(bootstrap, {',
    '      document: htmlTemplate(),',
    '      url: url.href,',
    '      allowedHosts: [url.hostname],',
    '    });',
    '    return new Response(renderedApp, {',
    '      headers: { "Content-Type": "text/html;charset=utf-8" },',
    '    });',
    '  },',
    '};',
  ].join('\n')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
}
