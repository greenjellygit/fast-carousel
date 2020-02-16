import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FastCarouselComponent } from './fast-carousel.component';

describe('FastCarouselComponent', () => {
  let component: FastCarouselComponent;
  let fixture: ComponentFixture<FastCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FastCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FastCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
