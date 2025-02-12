import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { environment } from '../../../../../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import tinymce from 'tinymce';
import { FormsModule} from '@angular/forms';
import { EDITOR_CONFIG } from '../../../../../shared/functions/editor.config.function';
import { ToastrService } from 'ngx-toastr';
import { Condition } from './models/terms_condition.model';
import { ConditionService } from './services/terms_condition.service';

@Component({
  selector: 'app-confidentialite',
  standalone: true,
  imports: [CommonModule, EditorModule, HttpClientModule, FormsModule],
  templateUrl: './terms_condition.component.html',
  styleUrl: './terms_condition.component.css',
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js' }
  ]
})
export class ConfidentialiteComponent implements OnInit, OnDestroy{

    termsCondition: Condition | null = null;
    error: string | null = null;
    successMessage: string | null = null;
    isSaving = false;
    editorConfig = EDITOR_CONFIG;
  
    constructor(private termCondition: ConditionService, private toost: ToastrService) {}
  
    ngOnInit() {
      this.loadtermsCondition();
    }
  
    ngOnDestroy() {
      tinymce.remove();
    }
  
    private loadtermsCondition() {
      this.termCondition.fetchtermsCondition().subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            // Prendre la dernière politique au lieu de la première
            this.termsCondition = data[data.length - 1];
            console.log('Données chargées:', this.termsCondition);
          } else {
            // Si aucune politique n'existe, initialiser une nouvelle
            this.initNewPolicy();
          }
        },
        error: (err) => {
          console.error('Erreur de chargement:', err);
          this.error = 'Erreur lors du chargement de la politique de confidentialité';
          this.initNewPolicy();
        }
      });
    }
  
    private initNewPolicy() {
      this.termsCondition = {
        title: '',
        description: '',
        key: 'privacy-policy-' + new Date().getTime() 
      };
    }
  
    onSubmit() {
      if (!this.termsCondition) return;
  
      // Validation
      if (!this.termsCondition.title?.trim()) {
        this.error = 'Le titre est obligatoire';
        return;
      }
  
      if (!this.termsCondition.description?.trim()) {
        this.error = 'La description est obligatoire';
        return;
      }
  
      this.isSaving = true;
      this.error = null;
      this.successMessage = null;
  
      const policyToSave = {
        title: this.termsCondition.title.trim(),
        description: this.termsCondition.description.trim(),
        key: this.termsCondition.key
      };
  
      this.termCondition.createtermsCondition(policyToSave).subscribe({
        next: () => {
          this.successMessage = 'Politique de confidentialité créée avec succès';
          this.isSaving = false;
          this.toost.success(this.successMessage);
          this.loadtermsCondition(); 
        },
        error: (err) => {
          console.error('Erreur de création:', err);
          if (err.error?.message && Array.isArray(err.error.message)) {
            this.error = err.error.message.join(', ');
          } else {
            this.error = 'Erreur lors de la création de la politique de confidentialité';
          }
          this.isSaving = false;
        }
      });
    }
  
    onReset() {
      this.loadtermsCondition(); 
      this.error = null;
      this.successMessage = null;
    }
  
    onEditorInit() {
      console.log('Éditeur initialisé');
    }
}