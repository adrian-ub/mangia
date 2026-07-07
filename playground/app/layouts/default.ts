import { Component } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'

@Component({
  selector: 'layout-default',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div>
      <h1>Mangia + Angular</h1>
      <nav>
        <a routerLink="/">Home</a> |
        <a routerLink="/about">About</a> |
        <a routerLink="/blog">Blog</a> |
        <a routerLink="/users">Users</a> |
        <a routerLink="/pricing">Pricing</a> |
        <a routerLink="/contact">Contact</a> |
        <a routerLink="/dashboard">Dashboard</a> |
        <a routerLink="/docs">Docs</a> |
        <a routerLink="/users-admin/42">User in Group (mixed segment)</a>
      </nav>
      <router-outlet />
    </div>
  `,
})
export default class DefaultLayout {}
