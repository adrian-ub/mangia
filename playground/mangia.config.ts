import { defineMangiaConfig } from 'mangia/config'

export default defineMangiaConfig({
  app: {
    head: {
      title: 'Mangia + Angular',
    },
  },
  modules: ['~/modules/example'],
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
