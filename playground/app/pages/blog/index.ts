import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'page-blog',
  imports: [RouterLink],
  template: `
    <h2>Blog</h2>
    <p>Latest posts:</p>
    <ul>
      <li><a routerLink="/blog/hello-world">Hello World</a></li>
      <li><a routerLink="/blog/angular-ssr">Angular SSR with Mangia</a></li>
      <li><a routerLink="/blog/file-based-routing">File-based Routing</a></li>
    </ul>
  `,
})
export default class BlogPage {}
