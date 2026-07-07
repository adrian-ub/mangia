import { Component, signal } from '@angular/core'
import { useHead } from 'mangia/unhead'

@Component({
  selector: 'page-about',
  template: `
    <h2 class="text-2xl font-semibold">About Mangia</h2>
    <p class="mt-4">Mangia is a metaframework for building Angular applications with SSR and static generation.</p>
    <p class="mt-4">Counter: <strong>{{ count() }}</strong></p>
    <button (click)="increment()" class="mt-2 px-4 py-2 rounded bg-blue-600 text-white cursor-pointer">
      Increment
    </button>
  `,
})
export default class AboutPage {
  count = signal(0)

  constructor() {
    useHead({
      title: () => `About (${this.count()}) | Mangia`,
    })
  }

  increment() {
    this.count.update(v => v + 1)
  }
}
