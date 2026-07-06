import { mergeApplicationConfig, reflectComponentType } from 'virtual:mangia/ng-core';
import { bootstrapApplication } from 'virtual:mangia/ng-platform-browser';
import { appConfig, head } from 'virtual:mangia/app-config';
import { __rootComponent } from 'virtual:mangia/root-component';
import clientAssets from './entry-client?assets=client';
import serverAssets from './entry-server?assets=ssr';

const { renderApplication, ɵSERVER_CONTEXT } = await import("virtual:mangia/ng-platform-server");
const { provideServerRendering } = await import("virtual:mangia/ng-ssr");

const __selector = reflectComponentType(__rootComponent)?.selector ?? 'app-root';

const config = mergeApplicationConfig(appConfig, {
  providers: [
    { provide: ɵSERVER_CONTEXT, useValue: 'ssr-mangia' },
    provideServerRendering(),
  ],
});

const bootstrap = (context: any) => bootstrapApplication(__rootComponent, config, context);

function htmlTemplate() {
  const scripts = clientAssets.js.map(a => `<script src="${a.href}" type="module"></script>`).join('');
  const styles = clientAssets.css.map(a => `<link rel="stylesheet" href="${a.href}">`).join('');
  const title = head?.title ? `<title>${head.title}</title>` : '';
  return `<!DOCTYPE html><html><head>${title}${styles}</head><body><${__selector}></${__selector}>${scripts}</body></html>`;
}

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const assets = clientAssets.merge(serverAssets);
    const renderedApp = await renderApplication(bootstrap, {
      document: htmlTemplate(),
      url: url.href,
      allowedHosts: [url.hostname],
    });
    return new Response(renderedApp, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  },
};
