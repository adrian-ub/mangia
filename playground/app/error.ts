import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'page-error',
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <a routerLink="/">Go home</a>
    </div>
  `,
  styles: [`
    .error-page {
      text-align: center;
      padding: 4rem 2rem;
    }
    h1 {
      font-size: 4rem;
      margin: 0;
      color: #e879f9;
    }
    h2 {
      margin: 0.5rem 0;
    }
    a {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      background: #e879f9;
      color: white;
      text-decoration: none;
      border-radius: 8px;
    }
  `],
})
export default class ErrorPage {}
