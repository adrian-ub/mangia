export interface Plugin {
  name: string
  enforce?: 'pre' | 'post'
  apply?: any
  config?: (config: any, env: any) => any | Promise<any>
  configResolved?: (config: any) => void | Promise<void>
  resolveId?: (id: string, importer?: string) => string | null | undefined
  load?: (id: string) => string | null | undefined | Promise<string | null | undefined>
  configureServer?: (server: any) => void | Promise<void>
  transform?: (code: string, id: string) => string | { code: string } | null | undefined
  hotUpdate?: (options: any) => any
  [key: string]: any
}
