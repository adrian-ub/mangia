import { glob } from 'tinyglobby'
import { relative, resolve } from 'pathe'

export interface LayoutScanOptions {
  layoutsDirs: string[]
  rootDir: string
}

export interface Layout {
  name: string
  file: string
}

export async function scanLayouts(options: LayoutScanOptions): Promise<Layout[]> {
  const { layoutsDirs, rootDir } = options

  const seen = new Set<string>()
  const all: Layout[] = []

  for (const layoutsDir of layoutsDirs) {
    const files = await glob('*.ts', { cwd: layoutsDir })

    for (const f of files) {
      const name = f.replace(/\.ts$/, '')
      if (!seen.has(name)) {
        seen.add(name)
        all.push({
          name,
          file: relative(rootDir, resolve(layoutsDir, f)),
        })
      }
    }
  }

  return all
}
