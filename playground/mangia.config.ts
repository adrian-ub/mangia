import tailwindcss from '@tailwindcss/vite'
import { defineMangiaConfig } from 'mangia/config'

export default defineMangiaConfig({
  app: {
    head: {
      title: 'Mangia + Angular',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Mangia — Angular SSR framework powered by Vite & Unhead' },
        { name: 'keywords', content: 'angular, ssr, vite, unhead, tailwindcss' },
      ],
    },
  },
  css: ['~/app.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['~/modules/example'],
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
