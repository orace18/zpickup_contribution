import { animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-animatebutton',
  imports: [CommonModule],
  templateUrl: './animatebutton.component.html',
  styleUrl: './animatebutton.component.css'
})
export class AnimatebuttonComponent implements OnInit {
  @Input() isLoading = false;
  @Input() label = 'Se Connecter';
  @Input() loadingText = 'Loading...';
  @Input() buttonClass = 'btn btn-lg btn-primary w-100 mb-5';

  constructor() {}

  ngOnInit(): void {}

  onClick(): void {
    if (!this.isLoading) {
      animate(this.label);
    }
  }
}
