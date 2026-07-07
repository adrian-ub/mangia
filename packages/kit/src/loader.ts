import { createRequire } from 'node:module'

export interface MangiaLoader {
  mangia: { createMangia: (opts: { rootDir: string }) => Promise<{ plugins: unknown[], close: () => Promise<void> }> }
  kit: { writeTypes: (opts: { rootDir: string }) => Promise<void> }
  schema: Record<string, unknown>
}

export async function loadMangia(rootDir: string): Promise<MangiaLoader> {
  const _require = createRequire(import.meta.url)

  const mangiaPath = _require.resolve('mangia', { paths: [rootDir] })
  const kitPath = _require.resolve('@mangia/kit', { paths: [rootDir] })
  const schemaPath = _require.resolve('@mangia/schema', { paths: [rootDir] })

  const [mangia, kit, schema] = await Promise.all([
    import(mangiaPath),
    import(kitPath),
    import(schemaPath),
  ])

  return { mangia, kit, schema } as unknown as MangiaLoader
}
