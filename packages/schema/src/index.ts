export interface MangiaConfig {
  srcDir?: string
  app?: MangiaAppConfig
  css?: string[]
  modules?: MangiaModule[]
  nitro?: Record<string, unknown>
  typescript?: MangiaTypeScriptConfig
}

export interface MangiaAppConfig {
  head?: MangiaHead
}

export interface MangiaHead {
  title?: string
  titleTemplate?: string
  meta?: Array<Record<string, string>>
  link?: Array<Record<string, string>>
  style?: Array<Record<string, string>>
  script?: Array<Record<string, string>>
  noscript?: Array<Record<string, string>>
  htmlAttrs?: Record<string, string>
  bodyAttrs?: Record<string, string>
}

export interface MangiaTypeScriptConfig {
  strict?: boolean
  tsConfig?: Record<string, unknown>
}

export interface MangiaHooks {
  'build:before': (config: MangiaConfig) => void | Promise<void>
  'build:done': (config: MangiaConfig) => void | Promise<void>
  'pages:extend': (pages: MangiaPage[]) => void | Promise<void>
  'pages:resolved': (pages: MangiaPage[]) => void | Promise<void>
  'nitro:config': (nitroConfig: Record<string, unknown>) => void | Promise<void>
}

export interface MangiaModule {
  meta?: MangiaModuleMeta
  setup: (context: MangiaModuleContext) => void | Promise<void>
  hooks?: Partial<MangiaHooks>
  defaults?: Partial<MangiaConfig>
}

export interface MangiaModuleMeta {
  name: string
  version?: string
  configKey?: string
  compatibility?: {
    mangia?: string
  }
}

export interface MangiaModuleContext {
  options: MangiaConfig
  addPlugin: (plugin: string | { src: string; mode?: 'client' | 'server' | 'all' }) => void
  extendPages: (cb: (pages: MangiaPage[]) => void) => void
  addHooks: (hooks: Partial<MangiaHooks>) => void
}

export interface MangiaPage {
  path: string
  name?: string
  file?: string
  children?: MangiaPage[]
  meta?: Record<string, unknown>
  data?: Record<string, unknown>
  alias?: string[]
  redirect?: string
}

export interface MangiaAppConfigInput {
  providers?: Array<unknown>
}
