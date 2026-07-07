declare module 'virtual:mangia/app-config' {
  import type { ApplicationConfig } from '@angular/core'

  export const appConfig: ApplicationConfig
  export const head: Record<string, unknown>
}

declare module 'virtual:mangia/root-component' {
  import type { Type } from '@angular/core'

  export const __rootComponent: Type<unknown>
}

declare module 'virtual:mangia/pages.ts' {
  import type { Routes } from '@angular/router'

  export const routes: Routes
}

declare module 'virtual:mangia/ng-compiler' {
  export { publishFacade } from '@angular/compiler'
}

declare module 'virtual:mangia/ng-core' {
  export { mergeApplicationConfig, reflectComponentType } from '@angular/core'
}

declare module 'virtual:mangia/ng-platform-browser' {
  export { bootstrapApplication } from '@angular/platform-browser'
}

declare module 'virtual:mangia/ng-platform-server' {
  export { ɵSERVER_CONTEXT, renderApplication } from '@angular/platform-server'
}

declare module 'virtual:mangia/ng-ssr' {
  export { provideServerRendering } from '@angular/ssr'
}

declare module 'nitro/vite' {
  import type { Plugin } from '../types'

  export function nitro(config?: Record<string, unknown>): Plugin[]
}

declare module '@oxc-angular/vite' {
  export function angular(options?: Record<string, unknown>): unknown[]
  const _default: unknown
  export default _default
}

declare module '*?url' {
  const url: string
  export default url
}

declare module '*?assets=client' {
  interface Asset { href: string }
  const assets: { js: Asset[], css: Asset[], merge: (other: typeof assets) => typeof assets }
  export default assets
}

declare module '*?assets=ssr' {
  interface Asset { href: string }
  const assets: { js: Asset[], css: Asset[], merge: (other: typeof assets) => typeof assets }
  export default assets
}
