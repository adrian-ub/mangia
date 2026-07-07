import { provideClientHead } from '@unhead/angular/client'
import { appConfig } from 'virtual:mangia/app-config'
import { bootstrapApplication } from 'virtual:mangia/ng-platform-browser'
import { __rootComponent } from 'virtual:mangia/root-component'

bootstrapApplication(__rootComponent, {
  ...appConfig,
  providers: [...(appConfig.providers || []), provideClientHead()],
})
  .catch((err: any) => console.error(err))
