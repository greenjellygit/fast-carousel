import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'fast-carousel';
  dataSource: Placeholder[];

  ngOnInit(): void {
    this.dataSource = [...Array(1000).keys()].map(i => ({text: (i + 1).toString()}));
  }
}

interface Placeholder {
  text: string;
}
