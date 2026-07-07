import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'page-pricing',
  imports: [RouterLink],
  template: `
    <h2>Pricing</h2>
    <p>Choose your plan:</p>
    <ul>
      <li><strong>Free</strong> — Basic features</li>
      <li><strong>Pro</strong> — \$9/mo — Advanced features</li>
      <li><strong>Enterprise</strong> — Custom pricing</li>
    </ul>
    <a routerLink="/">Go home</a>
  `,
})
export default class PricingPage {}
