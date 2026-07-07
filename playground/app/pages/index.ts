import { Component } from '@angular/core'
import { useHead } from 'mangia/unhead'

@Component({
  selector: 'page-home',
  template: `<h2 class="text-3xl font-semibold">Welcome to Mangia</h2>`,
})
export default class HomePage {
  constructor() {
    useHead({
      title: 'Home | Mangia + Angular',
      meta: [{ name: 'description', content: 'Home page of the Mangia playground' }],
    })
  }
}
