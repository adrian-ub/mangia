import { appConfig, head } from 'virtual:mangia/app-config'
import { mergeApplicationConfig, reflectComponentType } from 'virtual:mangia/ng-core'
import { bootstrapApplication } from 'virtual:mangia/ng-platform-browser'
import { __rootComponent } from 'virtual:mangia/root-component'
import clientAssets from './entry-client?assets=client'
import clientEntryUrl from './entry-client?url'

// eslint-disable-next-line antfu/no-top-level-await
const { renderApplication, ɵSERVER_CONTEXT } = await import('virtual:mangia/ng-platform-server')
// eslint-disable-next-line antfu/no-top-level-await
const { provideServerRendering } = await import('virtual:mangia/ng-ssr')
// eslint-disable-next-line antfu/no-top-level-await
const { provideServerHead } = await import('@unhead/angular/server')

const __selector = reflectComponentType(__rootComponent)?.selector ?? 'app-root'

const config = mergeApplicationConfig(appConfig, {
  providers: [
    { provide: ɵSERVER_CONTEXT, useValue: 'ssr-mangia' },
    provideServerRendering(),
    provideServerHead({ init: [head] }),
  ],
})

const bootstrap = (context: any) => bootstrapApplication(__rootComponent, config, context)

function htmlTemplate() {
  const productionCss = clientAssets.css.length > 0
  const styles = productionCss
    ? clientAssets.css.map((a: any) => `<link rel="stylesheet" href="${a.href}">`).join('')
    : (head?.link || []).filter((l: any) => l.rel === 'stylesheet').map((l: any) => `<link rel="stylesheet" href="${l.href}">`).join('')
  const scriptSrc = clientAssets.js.length > 0 ? clientAssets.js[0]!.href : clientEntryUrl
  const script = `<script src="${scriptSrc}" type="module"></script>`
  return `<!DOCTYPE html><html><head>${styles}</head><body><${__selector}></${__selector}>${script}</body></html>`
}

export default {
  async fetch(request: Request) {
    const url = new URL(request.url)
    return renderApp(url)
  },
}

async function renderApp(url: URL): Promise<Response> {
  try {
    const renderedApp = await renderApplication(bootstrap, {
      document: htmlTemplate(),
      url: url.href,
      allowedHosts: [url.hostname],
    })
    return new Response(renderedApp, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
    })
  }
  catch (err: any) {
    const isRouteError = err?.code === 4002
    const status = isRouteError ? 404 : 500
    const title = isRouteError ? 'Page Not Found' : 'Internal Server Error'
    const message = isRouteError
      ? `The path "${url.pathname}" was not found.`
      : 'An unexpected error occurred while rendering.'

    return new Response(
      `<!DOCTYPE html><html><head><title>${title}</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center"><h1>${status}</h1><p>${message}</p><a href="/">Go home</a></body></html>`,
      {
        status,
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      },
    )
  }
}
