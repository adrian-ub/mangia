import { createRequire } from 'node:module'
import { resolve } from 'pathe'

export async function loadUserMangia(rootDir: string) {
  const _require = createRequire(resolve(rootDir, 'package.json'))
  const mangiaPath = _require.resolve('mangia')
  return import(mangiaPath) as Promise<typeof import('mangia')>
}

export async function loadUserVite(rootDir: string) {
  const _require = createRequire(resolve(rootDir, 'package.json'))
  const vitePath = _require.resolve('vite')
  return import(vitePath) as Promise<typeof import('vite')>
}
