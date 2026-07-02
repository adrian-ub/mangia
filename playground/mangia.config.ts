import { defineMangiaConfig } from 'mangia/config'

export default defineMangiaConfig({
  app: {
    head: {
      title: 'Mangia + Angular',
    },
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
