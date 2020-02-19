import {CdkScrollable} from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {fromEvent, interval, Observable, Subject, Subscription} from 'rxjs';
import {concatMap, debounceTime, filter, map, take, takeUntil, tap, throttleTime} from 'rxjs/operators';

@Component({
  selector: 'fast-carousel',
  templateUrl: './fast-carousel.component.html',
  styleUrls: ['./fast-carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FastCarouselComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() public dataSource: any[];
  @Input() @HostBinding('style.backgroundColor') public backgroundColor: string;
  @Input() public duration: number = 150;
  @Input() public width: number;
  @Output() public slideChanged: EventEmitter<number> = new EventEmitter();
  @ContentChild(TemplateRef) public dataTemplate: TemplateRef<any>;

  @ViewChild(CdkScrollable) private cdkScrollable: CdkScrollable;
  @ViewChild('container') private container: ElementRef;
  private index = 0;
  private scrollSubject: Subject<ScrollEvent> = new Subject();
  private scrollSubscription: Subscription;
  private containerWidth: number = 0;

  constructor(private elementRef: ElementRef<HTMLElement>,
              private changeDetectorRef: ChangeDetectorRef) {
    this.scrollSubscription = this.scrollSubject.pipe(
      concatMap((e: ScrollEvent) => this.scrollTo(e))
    ).subscribe((index: number) => {
      this.slideChanged.emit(index);
    });
  }

  public ngOnInit(): void {
    fromEvent(window, 'resize').pipe(
      debounceTime(50)
    ).subscribe(() => {
      this.calculateWidth();
    });
  }

  public ngAfterViewInit(): void {
    this.calculateWidth();
    fromEvent(this.container.nativeElement, 'keydown').pipe(
      throttleTime(150)
    ).subscribe((e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') {
        this.prev();
      } else if (e.code === 'ArrowRight') {
        this.next();
      }
    });
  }

  public next(): void {
    if (this.index < this.dataSource.length - 1) {
      const targetX = ++this.index * this.getSlideWidth();
      this.scrollSubject.next({sourceX: targetX - this.getSlideWidth(), targetX, index: this.index});
    }
  }

  public prev(): void {
    if (this.index > 0) {
      const targetX = --this.index * this.getSlideWidth();
      this.scrollSubject.next({sourceX: targetX + this.getSlideWidth(), targetX, index: this.index});
    }
  }

  public onMouseDrag(e: MouseEvent): void {
    this.handleDrag(new SlideMouseDragEvent(e));
  }

  public onTouchDrag(e: TouchEvent): void {
    this.handleDrag(new SlideTouchDragEvent(e));
  }

  public onTouchCancel(): void {
    // not sure why touch start event stop work without this
  }

  public ngOnDestroy(): void {
    this.scrollSubscription.unsubscribe();
  }

  public getSlideWidth(): number {
    if (this.width != null) {
      return this.width;
    } else {
      return this.containerWidth;
    }
  }

  private calculateWidth() {
    this.containerWidth = this.elementRef.nativeElement.clientWidth;
    this.snapToIndex();
    this.changeDetectorRef.detectChanges();
  }

  private handleDrag(e: SlideDragEvent): void {
    const startDragX = e.getX();
    const startPos = this.cdkScrollable.measureScrollOffset('left');
    let lastDragX;

    const drag$ = e.drag$().pipe(
      throttleTime(10)
    );
    const stop$ = e.stop$();

    drag$.pipe(
      takeUntil(stop$),
      map((s: SlideDragEvent) => {
        lastDragX = s.getX();
        return this.clamp(startPos + (startDragX - s.getX()), startPos - this.getSlideWidth(), startPos + this.getSlideWidth());
      }),
      filter((left: number) => left !== startPos)
    ).subscribe((left: number) => {
      this.cdkScrollable.scrollTo({left, behavior: 'auto'});
    });

    stop$.pipe(
      take(1),
      filter(() => lastDragX != null)
    ).subscribe(() => {
      const toLeft: boolean = (startDragX - lastDragX) < 0;
      this.snapToDirection(toLeft);
    });
  }

  private scrollTo({sourceX, targetX, index}: ScrollEvent): Observable<number> {
    const fps: number = 60;
    const totalFrames: number = Math.round((this.duration / 1000) * fps);
    const renderInterval: number = 1000 / fps;

    return interval(renderInterval).pipe(
      take(totalFrames),
      map(frame => (frame + 1) / totalFrames),
      tap(percent => {
        const diff = targetX - sourceX;
        const partialPos = sourceX + (diff * percent);
        this.cdkScrollable.scrollTo({left: partialPos, behavior: 'auto'});
      }),
      filter(e => e === 1),
      map(() => index)
    );
  }

  private snapToDirection(toLeft: boolean): void {
    const sourceX = this.cdkScrollable.measureScrollOffset('left');
    const closestIndex = toLeft ? this.index - 1 : this.index + 1;
    if (closestIndex >= 0 && this.index !== closestIndex || (sourceX % this.getSlideWidth()) !== 0) {
      this.index = closestIndex;
      this.scrollSubject.next({sourceX, targetX: closestIndex * this.getSlideWidth(), index: closestIndex});
    }
  }

  private snapToIndex() {
    this.cdkScrollable.scrollTo({left: this.index * this.getSlideWidth(), behavior: 'auto'});
  }

  private clamp(value, min, max): number {
    if (min < 0) {
      min = 0;
    }
    return Math.min(Math.max(value, min), max);
  }
}

interface ScrollEvent {
  sourceX: number;
  targetX: number;
  index: number;
}

abstract class SlideDragEvent {
  abstract getX(): number;

  abstract stop$(): Observable<SlideDragEvent>;

  abstract drag$(): Observable<SlideDragEvent>;
}

class SlideTouchDragEvent implements SlideDragEvent {
  constructor(private event: TouchEvent) { }

  getX(): number {
    return this.event.targetTouches[0].clientX;
  }

  drag$(): Observable<SlideDragEvent> {
    return fromEvent(document, 'touchmove', {passive: true}).pipe(
      map((e: TouchEvent) => new SlideTouchDragEvent(e))
    );
  }

  stop$(): Observable<SlideDragEvent> {
    return fromEvent(document, 'touchend', {passive: true}).pipe(
      map((e: TouchEvent) => new SlideTouchDragEvent(e))
    );
  }
}

class SlideMouseDragEvent implements SlideDragEvent {
  constructor(private event: MouseEvent) { }

  getX(): number {
    return this.event.clientX;
  }

  drag$(): Observable<SlideDragEvent> {
    return fromEvent(document, 'mousemove').pipe(
      map((e: MouseEvent) => new SlideMouseDragEvent(e))
    );
  }

  stop$(): Observable<SlideDragEvent> {
    return fromEvent(document, 'mouseup').pipe(
      map((e: MouseEvent) => new SlideMouseDragEvent(e))
    );
  }
}
