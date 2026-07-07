import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { map } from 'rxjs'

@Component({
  selector: 'page-blog-post',
  imports: [RouterLink],
  template: `
    <h2>Blog Post: {{ slug() }}</h2>
    <p>Viewing post <strong>{{ slug() }}</strong></p>
    <a routerLink="/blog">Back to blog</a>
  `,
})
export default class BlogPostPage {
  private route = inject(ActivatedRoute)
  slug = toSignal(this.route.params.pipe(map(p => p.slug)), { initialValue: '' })
}
