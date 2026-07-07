import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { map } from 'rxjs'

@Component({
  selector: 'page-user-detail',
  imports: [RouterLink],
  template: `
    <h2>User #{{ id() }}</h2>
    <p>Profile page for user <strong>{{ id() }}</strong></p>
    <a routerLink="/users">Back to users</a>
  `,
})
export default class UserDetailPage {
  private route = inject(ActivatedRoute)
  id = toSignal(this.route.params.pipe(map(p => p.id)), { initialValue: '' })
}
