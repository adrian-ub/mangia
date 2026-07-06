import { existsSync } from 'node:fs'
import { resolve, relative } from 'pathe'
import type { Hookable } from 'hookable'
import type { MangiaHooks, MangiaPage, MangiaConfig } from '@mangia/schema'
import { scanPages, scanLayouts, getLayerDirectories } from '@mangia/kit'
import type { Layout } from '@mangia/kit'
import type { Plugin } from '../types'

const VIRTUAL_PAGES = 'virtual:mangia/pages.ts'
const RESOLVED_PAGES = '\0virtual:mangia/pages.ts'

export function pagesPlugin(
  srcDir: string,
  hooks: Hookable<MangiaHooks>,
  rootDir: string,
  config: MangiaConfig,
): Plugin {
  let pagesDirs: string[]
  let layoutsDirs: string[]
  let watchDirs: string[]

  return {
    name: 'mangia:pages',

    configResolved(_config: any) {
      const layerDirs = getLayerDirectories(config, rootDir)
      pagesDirs = layerDirs.map(d => d.appPages)
      layoutsDirs = layerDirs.map(d => d.appLayouts)
      watchDirs = [...new Set([...pagesDirs, ...layoutsDirs])]
    },

    resolveId(id: string) {
      if (id === VIRTUAL_PAGES) return RESOLVED_PAGES
    },

    async load(id: string) {
      if (id !== RESOLVED_PAGES) return

      const pages = await scanPages({ pagesDirs, rootDir })

      await hooks.callHook('pages:extend', pages as MangiaPage[])
      await hooks.callHook('pages:resolved', pages as MangiaPage[])

      const layouts = await scanLayouts({ layoutsDirs, rootDir })
      const defaultLayout = layouts.find(l => l.name === 'default')

      const layerDirs = getLayerDirectories(config, rootDir)
      let hasErrorComponent = false
      let errorFile = ''
      for (const dir of layerDirs) {
        const f = dir.appError
        if (existsSync(f)) {
          errorFile = f
          hasErrorComponent = true
          break
        }
      }

      return generateRoutesCode(pages as MangiaPage[], rootDir, defaultLayout, hasErrorComponent, errorFile, srcDir)
    },

    configureServer(server: any) {
      for (const dir of watchDirs) {
        server.watcher.add(dir)
      }
      server.watcher.add(resolve(rootDir, srcDir, 'error.ts'))

      const invalidate = () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED_PAGES)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }

      server.watcher.on('add', (path: string) => {
        if (!path.endsWith('.ts')) return
        invalidate()
      })

      server.watcher.on('unlink', (path: string) => {
        if (!path.endsWith('.ts')) return
        invalidate()
      })
    },
  }
}

function generateRouteEntry(route: MangiaPage, root: string, indent: string = '  '): string {
  if (route.path.includes('**') && route.file) {
    const idx = route.path.indexOf('**')
    const parent = route.path.slice(0, idx).replace(/\/$/, '')
    const importPath = '/' + relative(root, route.file)
    const loadComponent = `() => import('${importPath}').then(m => resolveComponent(m, '${importPath}'))`

    if (parent) {
      return `${indent}{ path: '${parent}', children: [{ path: '**', loadComponent: ${loadComponent} }] }`
    }
    return `${indent}{ path: '**', loadComponent: ${loadComponent} }`
  }

  const parts: string[] = []
  parts.push(`path: '${route.path}'`)

  if (route.file) {
    const importPath = '/' + relative(root, route.file)
    const loadComponent = `() => import('${importPath}').then(m => resolveComponent(m, '${importPath}'))`
    parts.push(`loadComponent: ${loadComponent}`)
  }

  if (route.data) {
    parts.push(`data: ${JSON.stringify(route.data)}`)
  }

  if (route.children?.length) {
    const childEntries = route.children.map(c => generateRouteEntry(c, root, indent + '  '))
    parts.push(`children: [\n${childEntries.join(',\n')}\n${indent}]`)
  }

  return `${indent}{ ${parts.join(', ')} }`
}

function generateRoutesCode(
  routes: MangiaPage[],
  root: string,
  defaultLayout?: Layout,
  hasErrorComponent?: boolean,
  errorFile?: string,
  srcDir?: string,
): string {
  const routeEntries = routes.map(r => generateRouteEntry(r, root))

  const wildcard = hasErrorComponent && errorFile
    ? `\n{ path: '**', loadComponent: () => import('/${relative(root, errorFile)}').then(m => resolveComponent(m, '/${srcDir}/error')) },`
    : `\n{ path: '**', component: DefaultErrorPage },`

  const defaultErrorClass = hasErrorComponent
    ? ''
    : [
        '',
        '@Component({',
        "  template: '<div style=\"padding:2rem;text-align:center\"><h1>404</h1><h2>Page Not Found</h2><p>The page you are looking for does not exist.</p><a routerLink=\"/\">Go home</a></div>',",
        '  imports: [RouterLink],',
        '  standalone: true,',
        '})',
        'class DefaultErrorPage {}',
      ].join('\n')

  const routesCode = defaultLayout
    ? `  {
    path: '',
    loadComponent: () => import('/${defaultLayout.file}').then(m => resolveComponent(m, '/${defaultLayout.file}')),
    children: [\n${routeEntries.join(',\n')}\n    ],
  },${wildcard}`
    : `${routeEntries.join(',\n')},${wildcard}`

  return [
    "import { ɵNG_COMP_DEF as NG_COMP_DEF } from '@angular/core';",
    "import { Component } from '@angular/core';",
    "import { RouterLink } from '@angular/router';",
    '',
    'function resolveComponent(m, path) {',
    '  const isComponent = (v) => typeof v === \'function\' && v[NG_COMP_DEF];',
    '',
    "  if (m.default && isComponent(m.default)) return m.default;",
    '',
    '  const component = Object.values(m).find(isComponent);',
    '  if (component) {',
    '    if (m.default) {',
    "      if (import.meta.env.DEV) {",
    "        console.warn(`[mangia] ${path}: default export is not a @Component, using first @Component found.`);",
    '      }',
    '    }',
    '    return component;',
    '  }',
    '',
    '  if (import.meta.env.DEV) {',
    "    console.warn(`[mangia] ${path}: no @Component found, rendering empty page.`);",
    '  }',
    '  return null;',
    '}',
    defaultErrorClass,
    '',
    'export const routes = [',
    routesCode,
    '];',
    '',
  ].join('\n')
}
