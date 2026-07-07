import { describe, expect, it } from 'vitest'

describe('@mangia/schema', () => {
  it('should export types correctly', async () => {
    const mod = await import('../src/index')
    expect(mod).toBeDefined()
  })
})
