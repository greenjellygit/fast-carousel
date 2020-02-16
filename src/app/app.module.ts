import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FastCarouselModule} from './fast-carousel/fast-carousel.module';
import {PlaceholderComponent} from './placeholder/placeholder.component';

@NgModule({
  declarations: [
    AppComponent,
    PlaceholderComponent
  ],
  imports: [
    BrowserModule,
    FastCarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
