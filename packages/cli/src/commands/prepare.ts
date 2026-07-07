import { createRequire } from 'node:module'
import process from 'node:process'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { resolve } from 'pathe'

export default defineCommand({
  meta: {
    name: 'prepare',
    description: 'Generate types and configuration for the project',
  },

  args: {
    rootDir: {
      type: 'positional',
      description: 'Project root directory',
      required: false,
      default: '.',
    },
  },

  async run({ args }) {
    const rootDir = resolve(process.cwd(), args.rootDir || '.')

    consola.info(`Preparing ${rootDir}`)

    try {
      const _require = createRequire(resolve(rootDir, 'package.json'))
      const kitPath = _require.resolve('@mangia/kit')
      const kit = await import(kitPath)

      kit.writeTypes({ rootDir })

      consola.success('Types generated in .mangia/types.d.ts')
    }
    catch (error) {
      consola.error('Prepare failed:', error)
      process.exit(1)
    }
  },
})
