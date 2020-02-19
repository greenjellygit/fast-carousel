import { enableProdMode } from '@angular/core';
import {enableDebugTools} from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then((app: any) => enableDebugTools(app))
  .catch(err => console.error(err));
