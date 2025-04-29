import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-date-range-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  templateUrl: './date-range-modal.component.html',
  styleUrl: './date-range-modal.component.css'
})
export class DateRangeModalComponent implements AfterViewInit, OnDestroy {

  @Output() dateRangeSelected = new EventEmitter<{startDate: string, endDate: string}>();
  today: string = new Date().toISOString().split('T')[0];
  dateForm: FormGroup;
  private modalInstance: any;

  constructor(private fb: FormBuilder) {
    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    // Initialiser le modal après que la vue soit chargée
    const modalElement = document.getElementById('kt_modal_select_period');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
    }
  }

  ngOnDestroy() {
    // Nettoyer l'instance du modal lors de la destruction du composant
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }

  onSubmit() {
    if (this.dateForm.valid) {
      const { startDate, endDate } = this.dateForm.value;
      this.dateRangeSelected.emit({ startDate, endDate });
      this.modalInstance?.hide();
    }
  }
  
}
