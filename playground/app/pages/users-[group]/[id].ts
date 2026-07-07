import { Component, inject } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs'

@Component({
  selector: 'page-user-group',
  imports: [RouterLink],
  template: `
    <h2>User in group {{ group() }}</h2>
    <p>User ID: <strong>{{ id() }}</strong></p>
    <p>Group: <strong>{{ group() }}</strong></p>
    <a routerLink="/users">Back to users</a>
  `,
})
export default class UserGroupPage {
  private route = inject(ActivatedRoute)
  id = toSignal(this.route.params.pipe(map(p => p['id'])), { initialValue: '' })
  group = toSignal(this.route.params.pipe(map(p => p['group'])), { initialValue: '' })
}
