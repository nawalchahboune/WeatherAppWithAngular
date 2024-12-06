import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  CommonModule
} from '@angular/common';
import {
  TestComponent
} from './components/main/main.component';

// @ts-ignore
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TestComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor() {}
  title = 'meteoProjectWebSemantique';
}
