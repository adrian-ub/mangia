import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'page-contact',
  imports: [RouterLink],
  template: `
    <h2>Contact</h2>
    <p>Get in touch with us:</p>
    <ul>
      <li>Email: hello&#64;mangia.dev</li>
      <li>Twitter: &#64;mangia_framework</li>
      <li>GitHub: github.com/mangia/mangia</li>
    </ul>
    <a routerLink="/">Go home</a>
  `,
})
export default class ContactPage {}
