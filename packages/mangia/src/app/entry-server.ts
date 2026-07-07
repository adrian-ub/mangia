// eslint-disable-next-line antfu/no-top-level-await
const { publishFacade } = await import('virtual:mangia/ng-compiler')
publishFacade(globalThis)
// eslint-disable-next-line antfu/no-top-level-await
const __handler = await import('./entry-server-handler')
export default __handler.default
