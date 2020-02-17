import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FastCarouselComponent} from './fast-carousel/fast-carousel.component';
import { FastCarouselDefDirective } from './fast-carousel/fast-carousel-def.directive';


@NgModule({
  declarations: [FastCarouselComponent, FastCarouselDefDirective],
  imports: [
    CommonModule,
    ScrollingModule
  ],
  exports: [FastCarouselComponent, FastCarouselDefDirective]
})
export class FastCarouselModule { }
