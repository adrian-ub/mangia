import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'page-users',
  imports: [RouterLink],
  template: `
    <h2>Users</h2>
    <ul>
      <li><a routerLink="/users/1">User 1</a></li>
      <li><a routerLink="/users/2">User 2</a></li>
      <li><a routerLink="/users/3">User 3</a></li>
    </ul>
  `,
})
export default class UsersPage {}
