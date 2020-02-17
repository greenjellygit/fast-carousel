import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'fast-carousel';
  dataSource: Placeholder[];
  slideIndex = 0;

  ngOnInit(): void {
    this.dataSource = [...Array(10000).keys()].map(i => ({text: (i + 1)}));
  }

  onSlideChanged(slideIndex: number) {
    this.slideIndex = slideIndex;
  }
}

interface Placeholder {
  text: number;
}
