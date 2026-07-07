import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanPages } from '../src/pages'

async function withTempDir(fn: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), 'mangia-test-'))
  try {
    await fn(dir)
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe('scanPages', () => {
  it('should parse index page', async () => {
    await withTempDir(async (dir) => {
      const pagesDir = join(dir, 'pages')
      mkdirSync(pagesDir, { recursive: true })
      writeFileSync(join(pagesDir, 'index.ts'), '')

      const pages = await scanPages({ pagesDirs: [pagesDir], rootDir: dir })

      expect(pages).toHaveLength(1)
      expect(pages[0].path).toBe('')
      expect(pages[0].file).toMatch(/index\.ts$/)
    })
  })

  it('should parse dynamic route', async () => {
    await withTempDir(async (dir) => {
      const pagesDir = join(dir, 'pages')
      mkdirSync(join(pagesDir, 'blog'), { recursive: true })
      writeFileSync(join(pagesDir, 'blog', '[slug].ts'), '')

      const pages = await scanPages({ pagesDirs: [pagesDir], rootDir: dir })

      expect(pages).toHaveLength(1)
      expect(pages[0].path).toBe('blog/:slug')
      expect(pages[0].file).toMatch(/\[slug\]\.ts$/)
    })
  })

  it('should parse catch-all route', async () => {
    await withTempDir(async (dir) => {
      const pagesDir = join(dir, 'pages')
      mkdirSync(join(pagesDir, 'docs'), { recursive: true })
      writeFileSync(join(pagesDir, 'docs', '[...slug].ts'), '')

      const pages = await scanPages({ pagesDirs: [pagesDir], rootDir: dir })

      expect(pages).toHaveLength(1)
      expect(pages[0].path).toContain('**')
      expect(pages[0].data?._catchAllParam).toBe('slug')
    })
  })

  it('should parse nested routes', async () => {
    await withTempDir(async (dir) => {
      const pagesDir = join(dir, 'pages')
      mkdirSync(pagesDir, { recursive: true })
      writeFileSync(join(pagesDir, 'index.ts'), '')
      writeFileSync(join(pagesDir, 'about.ts'), '')

      const pages = await scanPages({ pagesDirs: [pagesDir], rootDir: dir })

      expect(pages).toHaveLength(2)
      const pagePaths = pages.map(p => p.path)
      expect(pagePaths).toContain('')
      expect(pagePaths).toContain('about')
    })
  })

  it('should parse mixed segment route (e.g. users-[group]/[id])', async () => {
    await withTempDir(async (dir) => {
      const pagesDir = join(dir, 'pages')
      mkdirSync(join(pagesDir, 'users-[group]'), { recursive: true })
      writeFileSync(join(pagesDir, 'users-[group]', '[id].ts'), '')

      const pages = await scanPages({ pagesDirs: [pagesDir], rootDir: dir })

      expect(pages).toHaveLength(1)
      expect(pages[0].matcherCode).toBeDefined()
    })
  })

  it('should parse group route (parentheses)', async () => {
    await withTempDir(async (dir) => {
      const pagesDir = join(dir, 'pages')
      mkdirSync(join(pagesDir, '(marketing)'), { recursive: true })
      writeFileSync(join(pagesDir, '(marketing)', 'pricing.ts'), '')

      const pages = await scanPages({ pagesDirs: [pagesDir], rootDir: dir })

      expect(pages).toHaveLength(1)
      expect(pages[0].path).toBe('pricing')
    })
  })
})
