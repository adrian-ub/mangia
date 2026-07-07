import { Component } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'

@Component({
  selector: 'layout-default',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 text-gray-100">
      <header class="border-b border-gray-800">
        <div class="mx-auto max-w-5xl px-4 py-6">
          <h1 class="text-2xl font-bold tracking-tight">Mangia + Angular</h1>
          <nav class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
            <a routerLink="/" class="hover:text-white transition-colors">Home</a>
            <a routerLink="/about" class="hover:text-white transition-colors">About</a>
            <a routerLink="/blog" class="hover:text-white transition-colors">Blog</a>
            <a routerLink="/users" class="hover:text-white transition-colors">Users</a>
            <a routerLink="/pricing" class="hover:text-white transition-colors">Pricing</a>
            <a routerLink="/contact" class="hover:text-white transition-colors">Contact</a>
            <a routerLink="/dashboard" class="hover:text-white transition-colors">Dashboard</a>
            <a routerLink="/docs" class="hover:text-white transition-colors">Docs</a>
            <a routerLink="/users-admin/42" class="hover:text-white transition-colors">Users Admin</a>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-5xl px-4 py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export default class DefaultLayout {}
