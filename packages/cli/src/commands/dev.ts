import { defineCommand } from 'citty'
import { resolve } from 'pathe'
import { consola } from 'consola'
import { loadUserMangia, loadUserVite } from '../utils'

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },

  args: {
    rootDir: {
      type: 'positional',
      description: 'Project root directory',
      required: false,
      default: '.',
    },
    host: {
      type: 'string',
      alias: 'H',
      description: 'Host address',
      default: 'localhost',
    },
    port: {
      type: 'number',
      alias: 'p',
      description: 'Port number',
      default: 3000,
    },
  },

  async run({ args }) {
    const rootDir = resolve(process.cwd(), args.rootDir || '.')

    consola.info(`Starting dev server in ${rootDir}`)

    try {
      const mangia = await loadUserMangia(rootDir)
      const vite = await loadUserVite(rootDir)

      const instance = await mangia.createMangia({ rootDir })

      const server = await vite.createServer({
        root: rootDir,
        plugins: instance.plugins as any,
        server: {
          host: args.host,
          port: args.port,
        },
      })

      await server.listen()

      const resolvedHost = args.host === '0.0.0.0' ? 'localhost' : args.host
      consola.success(`Dev server running at http://${resolvedHost}:${args.port}`)

      server.printUrls()

      const stop = async () => {
        consola.info('Shutting down dev server...')
        await instance.close()
        await server.close()
        process.exit(0)
      }

      process.on('SIGTERM', stop)
      process.on('SIGINT', stop)
    } catch (error) {
      consola.error('Failed to start dev server:', error)
      process.exit(1)
    }
  },
})
