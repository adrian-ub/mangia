import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'pathe'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { execSync } from 'node:child_process'

export default defineCommand({
  meta: {
    name: 'preview',
    description: 'Launches the production server for local testing after `mangia build`.',
  },

  args: {
    rootDir: {
      type: 'positional',
      description: 'Project root directory',
      required: false,
      default: '.',
    },
    port: {
      type: 'string',
      description: 'Port to listen on',
      alias: ['p'],
    },
  },

  async run({ args }) {
    const rootDir = resolve(process.cwd(), args.rootDir || '.')
    const nitroJsonPath = resolve(rootDir, '.output', 'nitro.json')

    if (!existsSync(nitroJsonPath)) {
      consola.error('Cannot find .output/nitro.json. Did you run `mangia build` first?')
      process.exit(1)
    }

    const nitroJson = JSON.parse(readFileSync(nitroJsonPath, 'utf-8'))
    const previewCmd = nitroJson.commands?.preview

    if (!previewCmd) {
      consola.error('Preview is not supported for this build.')
      process.exit(1)
    }

    const outputDir = dirname(nitroJsonPath)
    const port = args.port || process.env.NITRO_PORT || process.env.PORT || '3000'

    consola.info(`Previewing production build at http://localhost:${port}`)

    execSync(previewCmd, {
      cwd: outputDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NITRO_PORT: port,
        PORT: port,
      },
    })
  },
})
