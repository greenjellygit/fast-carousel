import { TestBed } from '@angular/core/testing';

import { NgxFastCarouselService } from './ngx-fast-carousel.service';

describe('NgxFastCarouselService', () => {
  let service: NgxFastCarouselService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFastCarouselService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
