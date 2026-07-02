import { glob } from 'tinyglobby'
import { relative, resolve } from 'pathe'

export interface LayoutScanOptions {
  layoutsDir: string
  rootDir: string
}

export interface Layout {
  name: string
  file: string
}

export async function scanLayouts(options: LayoutScanOptions): Promise<Layout[]> {
  const { layoutsDir, rootDir } = options

  const files = await glob('*.ts', { cwd: layoutsDir })

  return files.map(f => ({
    name: f.replace(/\.ts$/, ''),
    file: relative(rootDir, resolve(layoutsDir, f)),
  }))
}
