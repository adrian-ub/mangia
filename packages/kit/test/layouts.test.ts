import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanLayouts } from '../src/layouts'

async function withTempDir(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'mangia-test-'))
  try {
    await fn(dir)
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe('scanLayouts', () => {
  it('should find layouts in directory', async () => {
    await withTempDir(async (dir) => {
      const layoutsDir = join(dir, 'layouts')
      mkdirSync(layoutsDir, { recursive: true })
      writeFileSync(join(layoutsDir, 'default.ts'), '')
      writeFileSync(join(layoutsDir, 'auth.ts'), '')

      const layouts = await scanLayouts({ layoutsDirs: [layoutsDir], rootDir: dir })

      expect(layouts).toHaveLength(2)
      expect(layouts.find(l => l.name === 'default')).toBeDefined()
      expect(layouts.find(l => l.name === 'auth')).toBeDefined()
    })
  })

  it('should deduplicate by name across multiple dirs (first wins)', async () => {
    await withTempDir(async (dir) => {
      const layoutsDir1 = join(dir, 'layouts1')
      const layoutsDir2 = join(dir, 'layouts2')
      mkdirSync(layoutsDir1, { recursive: true })
      mkdirSync(layoutsDir2, { recursive: true })
      writeFileSync(join(layoutsDir1, 'default.ts'), '')
      writeFileSync(join(layoutsDir2, 'default.ts'), '')

      const layouts = await scanLayouts({ layoutsDirs: [layoutsDir1, layoutsDir2], rootDir: dir })

      expect(layouts).toHaveLength(1)
      expect(layouts[0].file).toContain('layouts1')
    })
  })

  it('should return empty list when no layouts exist', async () => {
    await withTempDir(async (dir) => {
      const layoutsDir = join(dir, 'layouts')
      mkdirSync(layoutsDir, { recursive: true })

      const layouts = await scanLayouts({ layoutsDirs: [layoutsDir], rootDir: dir })

      expect(layouts).toHaveLength(0)
    })
  })
})
