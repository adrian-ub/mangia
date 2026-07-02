import { Component } from '@angular/core'
import { RouterOutlet, RouterLink } from '@angular/router'

@Component({
  selector: 'layout-default',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div>
      <h1>Mangia + Angular</h1>
      <nav>
        <a routerLink="/">Home</a>
      </nav>
      <router-outlet />
    </div>
  `,
})
export default class DefaultLayout {}
