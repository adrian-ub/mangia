import { appConfig } from 'virtual:mangia/app-config'
import { bootstrapApplication } from 'virtual:mangia/ng-platform-browser'
import { __rootComponent } from 'virtual:mangia/root-component'

bootstrapApplication(__rootComponent, appConfig)
  .catch((err: any) => console.error(err))
