import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.css']
})
export class PlaceholderComponent implements OnInit {

  @Input() text: number;
  asd: string;
  public imageWidth: number;

  ngOnInit(): void {
    this.imageWidth = this.getRandomArbitrary(200, 500);
    this.asd = ' blabla';
  }

  getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
}
