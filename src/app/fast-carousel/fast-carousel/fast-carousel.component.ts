import {CdkScrollable} from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {fromEvent, interval, Observable, Subject, Subscription} from 'rxjs';
import {concatMap, filter, map, take, takeUntil, tap, throttleTime} from 'rxjs/operators';

@Component({
  selector: 'fast-carousel',
  templateUrl: './fast-carousel.component.html',
  styleUrls: ['./fast-carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FastCarouselComponent implements AfterViewInit, OnDestroy {

  @Input() public dataSource: any[];
  @Input() public duration: number = 150;
  @Input() public width: number = 200;
  @Output() public slideChanged: EventEmitter<number> = new EventEmitter();
  @ContentChild(TemplateRef) public dataTemplate: TemplateRef<any>;

  @ViewChild(CdkScrollable) private cdkScrollable: CdkScrollable;
  @ViewChild('container') private container: ElementRef;
  private index = 0;
  private scrollSubject: Subject<ScrollEvent> = new Subject();
  private scrollSubscription: Subscription;

  constructor() {
    this.scrollSubscription = this.scrollSubject.pipe(
      concatMap((e: ScrollEvent) => this.scrollTo(e))
    ).subscribe((index: number) => {
      this.slideChanged.emit(index);
    });
  }

  public ngAfterViewInit(): void {
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
      const targetX = ++this.index * this.width;
      this.scrollSubject.next({sourceX: targetX - this.width, targetX, index: this.index});
    }
  }

  public prev(): void {
    if (this.index > 0) {
      const targetX = --this.index * this.width;
      this.scrollSubject.next({sourceX: targetX + this.width, targetX, index: this.index});
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
        return this.clamp(startPos + (startDragX - s.getX()), startPos - this.width, startPos + this.width);
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
      this.snapToClosest(toLeft);
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

  private snapToClosest(toLeft: boolean): void {
    const sourceX = this.cdkScrollable.measureScrollOffset('left');
    const closestIndex = toLeft ? this.index - 1 : this.index + 1;
    if (closestIndex >= 0 && this.index !== closestIndex || (sourceX % this.width) !== 0) {
      this.index = closestIndex;
      this.scrollSubject.next({sourceX, targetX: closestIndex * this.width, index: closestIndex});
    }
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
    return fromEvent(document, 'touchmove').pipe(
      map((e: TouchEvent) => new SlideTouchDragEvent(e))
    );
  }

  stop$(): Observable<SlideDragEvent> {
    return fromEvent(document, 'touchend').pipe(
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
