import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FastCarouselComponent} from './fast-carousel/fast-carousel.component';


@NgModule({
  declarations: [FastCarouselComponent],
  imports: [
    CommonModule,
    ScrollingModule
  ],
  exports: [FastCarouselComponent]
})
export class FastCarouselModule { }
