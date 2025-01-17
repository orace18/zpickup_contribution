import {Component, Input} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './loading.component.html',
  standalone: true,
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  @Input() message?: string;
  @Input() overlay: boolean = false;
}
