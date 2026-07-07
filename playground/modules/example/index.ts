import { defineMangiaModule } from 'mangia'

export default defineMangiaModule({
  meta: {
    name: 'example',
    version: '0.1.0',
  },
  setup(ctx) {
    const componentPath = new URL('./components/ModuleComponent.ts', import.meta.url).pathname

    ctx.extendPages((pages) => {
      pages.push({
        path: 'module-demo',
        name: 'module-demo',
        file: componentPath,
      })
    })

    ctx.addHooks({
      'nitro:config': function (nitroConfig) {
        nitroConfig.framework = {
          ...nitroConfig.framework as Record<string, unknown>,
          _extendedByModule: 'example',
        }
      },
    })
  },
})
