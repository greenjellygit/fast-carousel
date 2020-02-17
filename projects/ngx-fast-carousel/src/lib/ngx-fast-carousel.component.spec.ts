import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFastCarouselComponent } from './ngx-fast-carousel.component';

describe('NgxFastCarouselComponent', () => {
  let component: NgxFastCarouselComponent;
  let fixture: ComponentFixture<NgxFastCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxFastCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxFastCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
