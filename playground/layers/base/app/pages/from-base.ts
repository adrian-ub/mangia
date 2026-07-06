import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'page-from-base',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="padding:2rem">
      <h2>From Base Layer</h2>
      <p>This page comes from <code>layers/base/app/pages/</code></p>
      <a routerLink="/">Go home</a>
    </div>
  `,
})
export default class FromBasePage {}
