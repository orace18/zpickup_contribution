import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {

  @Input() isOpen = false;
  @Input() title = 'Êtes-vous sûr de vouloir annuler ?';
  @Input() description = '';
  @Input() confirmText = 'Oui, annuler !';
  @Input() cancelText = 'Non, retour';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() closeDialog = new EventEmitter<void>();

  onConfirmClick(): void {
    this.confirm.emit();
    this.closeDialog.emit();
  }

  onCancelClick(): void {
    this.cancel.emit();
    this.closeDialog.emit();
  }
}
