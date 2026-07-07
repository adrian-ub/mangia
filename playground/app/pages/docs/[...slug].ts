import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { map } from 'rxjs'

@Component({
  selector: 'page-docs',
  imports: [RouterLink],
  template: `
    <h2>Documentation</h2>
    <p>Path: <strong>{{ path() || '/' }}</strong></p>
    <p>This is a catch-all route. Any sub-path under <code>/docs/</code> will match here.</p>
    <a routerLink="/">Go home</a>
  `,
})
export default class DocsPage {
  private route = inject(ActivatedRoute)
  path = toSignal(this.route.params.pipe(map(p => p.slug || '/')), { initialValue: '' })
}
