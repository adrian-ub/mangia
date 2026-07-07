import type { MangiaPage } from '@mangia/schema'
import { relative, resolve } from 'pathe'
import { glob } from 'tinyglobby'
import { buildTree } from 'unrouting'

export interface PagesScanOptions {
  pagesDirs: string[]
  rootDir: string
  extensions?: string[]
}

export interface ParsedRoute {
  route: MangiaPage
  flatRoutes: MangiaPage[]
}

export async function scanPages(options: PagesScanOptions): Promise<MangiaPage[]> {
  const { pagesDirs, rootDir, extensions = ['.ts'] } = options

  const extPattern = extensions.length === 1
    ? `*${extensions[0]}`
    : `*{${extensions.join(',')}}`
  const pattern = `**/${extPattern}`

  const seenPaths = new Set<string>()

  const allFiles: string[] = []
  for (const pagesDir of pagesDirs) {
    const files = await glob(pattern, {
      cwd: pagesDir,
      ignore: ['**/*.spec.ts', '**/*.test.ts'],
    })
    for (const f of files) {
      const filePath = relative(rootDir, resolve(pagesDir, f))
      if (!seenPaths.has(filePath)) {
        seenPaths.add(filePath)
        allFiles.push(filePath)
      }
    }
  }

  const opts = { roots: pagesDirs.map(d => `${relative(rootDir, d)}/`), extensions }
  const tree = buildTree(allFiles, opts)

  return toAngularRouter(tree)
}

export function extendPages(pages: MangiaPage[], cb: (pages: MangiaPage[]) => MangiaPage[] | void): MangiaPage[] {
  const result = cb(pages)
  return result ?? pages
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface IntermediateRoute {
  name: string
  path: string
  file: string
  children: IntermediateRoute[]
  groups: string[]
  catchAllParam?: string
  scoreSegments?: number[]
  needsMatcher?: boolean
  matcherSegments?: any[][]
}

function flattenTree(tree: any): any[] {
  const infos: any[] = []
  ;(function walk(node: any) {
    const defaults = node.files.filter((f: any) => f.viewName === 'default')
    const byGroupPath = new Map<string, any[]>()
    for (const f of (defaults.length > 0 ? defaults : node.files)) {
      const key = f.groups.join(',')
      let group = byGroupPath.get(key)
      if (!group) {
        group = []
        byGroupPath.set(key, group)
      }
      group.push(f)
    }
    for (const [, groupFiles] of byGroupPath) {
      const primary = groupFiles[0]
      const segments: any[] = []
      for (const seg of primary.originalSegments) {
        if (!seg.every((t: any) => t.type === 'group'))
          segments.push(seg)
      }
      infos.push({
        file: primary.path,
        relativePath: primary.relativePath,
        segments,
        groups: primary.groups,
        siblingFiles: groupFiles,
      })
    }
    for (const child of node.children.values()) walk(child)
  })(tree.root)
  return infos
}

function isIndexSegment(tokens: any[]): boolean {
  return tokens.length === 1 && tokens[0].type === 'static' && tokens[0].value === ''
}

function toAngularSegment(tokens: any[]): { segment: string, catchAllParam?: string, needsMatcher?: boolean } {
  const nonGroup = tokens.filter((t: any) => t.type !== 'group')
  const hasVar = nonGroup.some((t: any) => t.type === 'dynamic' || t.type === 'optional')
  const needsMatcher = hasVar && nonGroup.length > 1

  let out = ''
  let catchAllParam: string | undefined
  for (const token of tokens) {
    switch (token.type) {
      case 'group': continue
      case 'static':
        out += token.value
        break
      case 'dynamic':
        out += `:${token.value}`
        break
      case 'optional':
        out += `:${token.value}?`
        break
      case 'catchall':
      case 'repeatable':
      case 'optional-repeatable':
        out = '**'
        catchAllParam = token.value
        break
    }
  }
  return { segment: out, catchAllParam, needsMatcher }
}

function toAngularRouter(tree: any): MangiaPage[] {
  const fileInfos = flattenTree(tree)
  const collator = new Intl.Collator('en-US')

  fileInfos.sort((a, b) =>
    a.relativePath.length - b.relativePath.length || collator.compare(a.relativePath, b.relativePath),
  )

  const routes: IntermediateRoute[] = []

  for (const info of fileInfos) {
    const route: IntermediateRoute = {
      name: '',
      path: '',
      file: info.file,
      children: [],
      groups: info.groups,
    }
    let parent = routes

    if (info.segments.length === 0)
      route.path = '/'

    for (let i = 0; i < info.segments.length; i++) {
      const seg = info.segments[i]
      const isIndex = isIndexSegment(seg)
      const segmentName = isIndex ? 'index' : seg.map((t: any) => t.type === 'group' ? '' : t.value).join('')

      route.name += (route.name && '/') + segmentName

      const { segment: angularSegment, catchAllParam, needsMatcher } = toAngularSegment(seg)
      if (catchAllParam)
        route.catchAllParam = catchAllParam
      if (needsMatcher)
        route.needsMatcher = true

      const routePath = isIndex ? '' : `/${angularSegment}`
      const fullPath = (route.path || '/') + (isIndex ? '' : routePath)

      const match = parent.find(r => r.name === route.name && r.path === fullPath)

      if (match?.children) {
        parent = match.children
        route.path = ''
      }
      else if (segmentName === 'index' && !route.path) {
        route.path += '/'
      }
      else if (segmentName !== 'index') {
        route.path += routePath
      }
    }

    if (route.needsMatcher) {
      route.matcherSegments = info.segments.filter((seg: any[]) => !isIndexSegment(seg))
    }

    parent.push(route)
  }

  return prepareRoutes(routes)
}

function computeScoreSegments(route: IntermediateRoute): number[] {
  return route.path.split('/').filter(Boolean).map((part) => {
    if (part === '**')
      return -400
    if (part.startsWith(':'))
      return 300
    if (part.includes(':'))
      return 250
    return 400
  })
}

function generateMatcherCode(route: IntermediateRoute): string {
  const segments = route.matcherSegments || []
  const totalSegments = segments.length

  const captureList: Array<{ name: string, regexIdx: number, groupIdx: number }> = []
  const patternInfo: Array<{ regex: string | null, hasDynamic: boolean }> = []

  for (const segTokens of segments) {
    const nonGroup = segTokens.filter((t: any) => t.type !== 'group')
    const hasDynamic = nonGroup.some((t: any) => t.type === 'dynamic' || t.type === 'optional')

    if (!hasDynamic) {
      const literal = nonGroup.map((t: any) => t.value).join('')
      patternInfo.push({ regex: `^${escapeRegex(literal)}$`, hasDynamic: false })
    }
    else if (nonGroup.length === 1 && nonGroup[0].type === 'dynamic') {
      patternInfo.push({ regex: null, hasDynamic: true })
      captureList.push({ name: nonGroup[0].value, regexIdx: patternInfo.length - 1, groupIdx: 0 })
    }
    else if (nonGroup.length === 1 && nonGroup[0].type === 'optional') {
      patternInfo.push({ regex: null, hasDynamic: true })
      captureList.push({ name: nonGroup[0].value, regexIdx: patternInfo.length - 1, groupIdx: 0 })
    }
    else {
      let re = '^'
      let groupIdx = 0
      for (const t of nonGroup) {
        if (t.type === 'static') {
          re += escapeRegex(t.value)
        }
        else if (t.type === 'dynamic' || t.type === 'optional') {
          re += t.type === 'optional' ? '([^/]*)' : '([^/]+)'
          groupIdx++
          captureList.push({ name: t.value, regexIdx: patternInfo.length, groupIdx })
        }
      }
      re += '$'
      patternInfo.push({ regex: re, hasDynamic: true })
    }
  }

  const checks: string[] = [`if(segments.length<${totalSegments})return null`]
  for (let i = 0; i < totalSegments; i++) {
    const info = patternInfo[i]
    if (info?.regex) {
      checks.push(`const m${i}=segments[${i}].path.match(/${info.regex.replace(/\//g, '\\/')}/)`)
      checks.push(`if(!m${i})return null`)
    }
  }

  const posParams: string[] = []
  for (const cap of captureList) {
    const ri = cap.regexIdx
    if (patternInfo[ri]?.regex) {
      posParams.push(`${cap.name}:new UrlSegment(m${ri}[${cap.groupIdx}],{})`)
    }
    else {
      posParams.push(`${cap.name}:segments[${ri}]`)
    }
  }

  return `function(segments){${checks.join(';')};return{consumed:segments.slice(0,${totalSegments}),posParams:{${posParams.join(',')}}}}`
}

function prepareRoutes(routes: IntermediateRoute[], _parent?: IntermediateRoute): MangiaPage[] {
  const collator = new Intl.Collator('en-US')

  for (const route of routes) {
    route.scoreSegments = computeScoreSegments(route)
  }
  routes.sort((a, b) => {
    const aScore = a.scoreSegments!
    const bScore = b.scoreSegments!
    const len = Math.max(aScore.length, bScore.length)
    for (let i = 0; i < len; i++) {
      const sa = aScore[i] ?? -Infinity
      const sb = bScore[i] ?? -Infinity
      if (sa !== sb)
        return sb - sa
    }
    return collator.compare(a.path, b.path)
  })

  return routes.map((route) => {
    let name = route.name.replace(/\/index$/g, '').replace(/\//g, '-') || 'index'
    let path = route.path

    if (path[0] === '/')
      path = path.slice(1)

    const children = route.children.length ? prepareRoutes(route.children, route) : []
    if (children.some(c => c.path === ''))
      name = undefined as any

    const out: MangiaPage = { path }
    if (route.file)
      out.file = route.file
    if (name)
      out.name = name
    if (route.groups.length > 0)
      out.meta = { ...out.meta, groups: route.groups }
    if (route.catchAllParam)
      out.data = { ...out.data, _catchAllParam: route.catchAllParam }
    if (route.needsMatcher)
      out.matcherCode = generateMatcherCode(route)
    if (children.length > 0)
      out.children = children

    return out
  }) as MangiaPage[]
}
