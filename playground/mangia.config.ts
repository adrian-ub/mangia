import tailwindcss from '@tailwindcss/vite'
import { defineMangiaConfig } from 'mangia/config'

export default defineMangiaConfig({
  app: {
    head: {
      title: 'Mangia + Angular',
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
