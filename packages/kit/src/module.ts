import type { MangiaModule, MangiaModuleMeta, MangiaModuleContext, MangiaConfig, MangiaHooks } from '@mangia/schema'

export interface MangiaModuleDefinition {
  meta?: MangiaModuleMeta
  defaults?: Partial<MangiaConfig>
  hooks?: Partial<MangiaHooks>
  setup: (this: MangiaModuleContext, context: MangiaModuleContext) => void | Promise<void>
}

export function defineMangiaModule(def: MangiaModuleDefinition): MangiaModule {
  return {
    meta: def.meta,
    defaults: def.defaults,
    hooks: def.hooks,
    setup(context) {
      return def.setup.call(context, context)
    },
  }
}
