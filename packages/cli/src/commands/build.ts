import type { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { resolve } from 'pathe'
import { loadUserMangia, loadUserVite } from '../utils'

function routeToPath(route: string): string {
  const clean = route.replace(/\/$/, '') || '/'
  return clean === '/' ? 'index.html' : `${clean.slice(1)}/index.html`
}

async function generateStatic(rootDir: string, routes: string[]) {
  const outDir = resolve(rootDir, '.output/public')
  const serverEntry = resolve(rootDir, '.output/server/index.mjs')
  const port = 3000 + Math.floor(Math.random() * 10000)

  const proc = spawn(process.execPath, [serverEntry], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
  })

  let started = false
  await new Promise<void>((resolvePromise, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server start timeout'))
    }, 30000)

    const onData = (chunk: Buffer) => {
      if (!started && chunk.toString().includes('http://')) {
        started = true
        clearTimeout(timeout)
        resolvePromise()
      }
    }

    proc.stdout?.on('data', onData)
    proc.stderr?.on('data', onData)
    proc.on('error', reject)
    proc.on('exit', (code) => {
      clearTimeout(timeout)
      if (!started)
        reject(new Error(`Server exited with code ${code}`))
    })
  })

  try {
    for (const route of routes) {
      const url = `http://127.0.0.1:${port}${route}`
      consola.info(`  Generating ${route}`)
      const res = await fetch(url)
      if (!res.ok) {
        consola.warn(`  ${route} returned ${res.status}, skipping`)
        continue
      }
      const html = await res.text()
      const filePath = resolve(outDir, routeToPath(route))
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, html, 'utf-8')
    }
  }
  finally {
    proc.kill()
  }
}

export default defineCommand({
  meta: {
    name: 'build',
    description: 'Build the application for production',
  },

  args: {
    rootDir: {
      type: 'positional',
      description: 'Project root directory',
      required: false,
      default: '.',
    },
    analyze: {
      type: 'boolean',
      alias: 'a',
      description: 'Analyze bundle',
    },
  },

  async run({ args }) {
    const rootDir = resolve(process.cwd(), args.rootDir || '.')

    consola.info(`Building ${rootDir}`)

    try {
      const mangia = await loadUserMangia(rootDir)
      const vite = await loadUserVite(rootDir)

      const instance = await mangia.createMangia({ rootDir })

      const builder = await vite.createBuilder({
        root: rootDir,
        plugins: instance.plugins as any,
      })
      await builder.buildApp()
      await builder.runDevTools?.()

      const prerenderRoutes = instance.config.nitro?.prerender?.routes as string[] | undefined
      if (prerenderRoutes && prerenderRoutes.length > 0) {
        consola.info('Generating static files...')
        await generateStatic(rootDir, prerenderRoutes)
      }

      consola.success('Build complete')
      await instance.close()
    }
    catch (error) {
      consola.error('Build failed:', error)
      process.exit(1)
    }
  },
})
