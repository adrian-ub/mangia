import { Component } from '@angular/core'

@Component({
  selector: 'module-component',
  template: `
    <div class="module-card">
      <div class="module-badge">MODULE</div>
      <h3>Example Module</h3>
      <p>This component is provided by <code>modules/example/</code></p>
      <ul>
        <li>Route registered via <code>pages:extend</code></li>
        <li>Nitro config extended via <code>nitro:config</code></li>
      </ul>
    </div>
  `,
  styles: [`
    .module-card {
      border: 2px solid #e879f9;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      background: linear-gradient(135deg, #faf5ff, #fdf2f8);
    }
    .module-badge {
      display: inline-block;
      background: #e879f9;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    h3 { margin: 0 0 0.5rem; }
    code {
      background: #e5e7eb;
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-size: 0.85rem;
    }
    ul { margin: 0.5rem 0 0; padding-left: 1.25rem; }
    li { margin-bottom: 0.25rem; }
  `],
})
export default class ModuleComponent {}
