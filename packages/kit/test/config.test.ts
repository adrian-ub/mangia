import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'pathe'
import { describe, expect, it } from 'vitest'
import { loadMangiaConfig } from '../src/config'

async function withTempDir(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(resolve(tmpdir(), 'mangia-test-'))
  try {
    await fn(dir)
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe('loadMangiaConfig', () => {
  it('should load config with defaults', async () => {
    await withTempDir(async (dir) => {
      const config = await loadMangiaConfig({ rootDir: dir })

      expect(config.srcDir).toBe('app')
      expect(config._layers).toHaveLength(1)
      expect(config._layers![0].cwd).toBe(dir)
    })
  })

  it('should load config from mangia.config.ts', async () => {
    await withTempDir(async (dir) => {
      writeFileSync(
        resolve(dir, 'mangia.config.ts'),
        'export default { srcDir: "src" }',
      )

      const config = await loadMangiaConfig({ rootDir: dir })

      expect(config.srcDir).toBe('src')
    })
  })

  it('should discover layers from layers/* directory', async () => {
    await withTempDir(async (dir) => {
      const layerDir = resolve(dir, 'layers', 'base')
      mkdirSync(layerDir, { recursive: true })
      writeFileSync(
        resolve(layerDir, 'mangia.config.ts'),
        'export default { srcDir: "layer-src" }',
      )

      const config = await loadMangiaConfig({ rootDir: dir })

      const layers = config._layers ?? []
      expect(layers.length).toBeGreaterThanOrEqual(2)
      const baseLayer = layers.find(l => l.cwd === layerDir)
      expect(baseLayer).toBeDefined()
    })
  })

  it('should merge overrides on top of config', async () => {
    await withTempDir(async (dir) => {
      writeFileSync(
        resolve(dir, 'mangia.config.ts'),
        'export default { css: ["/style.css"] }',
      )

      const config = await loadMangiaConfig({
        rootDir: dir,
        overrides: { srcDir: 'custom' },
      })

      expect(config.srcDir).toBe('custom')
      expect(config.css).toEqual(['/style.css'])
    })
  })
})
