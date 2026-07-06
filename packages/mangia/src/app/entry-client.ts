import { appConfig } from 'virtual:mangia/app-config';
import { __rootComponent } from 'virtual:mangia/root-component';
import { bootstrapApplication } from 'virtual:mangia/ng-platform-browser';

bootstrapApplication(__rootComponent, appConfig)
  .catch((err) => console.error(err));
