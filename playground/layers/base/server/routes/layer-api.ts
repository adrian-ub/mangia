import { defineEventHandler } from 'nitro/h3'

export default defineEventHandler(() => {
  return { from: 'base-layer', message: 'This API route comes from layers/base/server/' }
})
