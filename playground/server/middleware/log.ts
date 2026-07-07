import { defineEventHandler } from 'nitro/h3'

export default defineEventHandler((event) => {
  console.warn(`[${new Date().toISOString()}] ${event.method} ${event.path}`)
})
