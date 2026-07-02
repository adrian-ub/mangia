import { createRequire } from 'node:module'

export interface MangiaLoader {
  mangia: typeof import('mangia')
  kit: typeof import('@mangia/kit')
  schema: typeof import('@mangia/schema')
}

export async function loadMangia(rootDir: string): Promise<MangiaLoader> {
  const _require = createRequire(import.meta.url)

  const mangiaPath = _require.resolve('mangia', { paths: [rootDir] })
  const kitPath = _require.resolve('@mangia/kit', { paths: [rootDir] })
  const schemaPath = _require.resolve('@mangia/schema', { paths: [rootDir] })

  const [mangia, kit, schema] = await Promise.all([
    import(mangiaPath) as Promise<typeof import('mangia')>,
    import(kitPath) as Promise<typeof import('@mangia/kit')>,
    import(schemaPath) as Promise<typeof import('@mangia/schema')>,
  ])

  return { mangia, kit, schema }
}
