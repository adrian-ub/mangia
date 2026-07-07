import { describe, it, expect } from 'vitest'

describe('@mangia/schema', () => {
  it('should export types correctly', async () => {
    const mod = await import('../src/index')
    expect(mod).toBeDefined()
  })
})
