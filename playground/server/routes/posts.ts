import { defineEventHandler } from 'nitro/h3'
import type { Post } from '../../shared/types/post'

const posts: Post[] = [
  { id: 1, title: 'Getting Started with Mangia', body: 'Mangia is a metaframework for Angular...' },
  { id: 2, title: 'SSR with Angular', body: 'Server-side rendering with Angular and Nitro...' },
]

export default defineEventHandler(() => {
  return posts
})
