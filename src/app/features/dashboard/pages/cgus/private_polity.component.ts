import { PrivacyPolicyService } from './services/private_polity.service';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { PrivacyPolicy } from './models/private_polity.model';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { environment } from '../../../../../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import tinymce from 'tinymce';
import { FormsModule} from '@angular/forms';
import { EDITOR_CONFIG } from '../../../../../shared/functions/editor.config.function';
import { ToastrService } from 'ngx-toastr';
import { LoadingComponent } from "../../../../../core/components/loading/loading.component";

@Component({
  selector: 'app-cgus',
  imports: [CommonModule, EditorModule, HttpClientModule, FormsModule, LoadingComponent],
  standalone: true,
  templateUrl: './private_polity.component.html',
  styleUrl: './private_polity.component.css',
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js' }
  ]
})
export class CgusComponent implements OnInit, OnDestroy {
  privacyPolicy: PrivacyPolicy | null = null;
  error: string | null = null;
  successMessage: string | null = null;
  isSaving = false;
  editorConfig = EDITOR_CONFIG;
  isLoading: boolean = false;
  loadingMessage: string = 'Chargement des données...';

  constructor(private privacyPolicyService: PrivacyPolicyService, private toost: ToastrService) {}

  ngOnInit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.loadPrivacyPolicy();
    }, 2000);
  
  }

  ngOnDestroy() {
    tinymce.remove();
  }

  private loadPrivacyPolicy() {
    this.privacyPolicyService.fetchPrivacyPolicy().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Prendre la dernière politique au lieu de la première
          this.privacyPolicy = data[data.length - 1];
          console.log('Données chargées:', this.privacyPolicy);
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
    this.privacyPolicy = {
      title: '',
      description: '',
      key: 'privacy-policy-' + new Date().getTime() 
    };
  }

  onSubmit() {
    if (!this.privacyPolicy) return;

    // Validation
    if (!this.privacyPolicy.title?.trim()) {
      this.error = 'Le titre est obligatoire';
      return;
    }

    if (!this.privacyPolicy.description?.trim()) {
      this.error = 'La description est obligatoire';
      return;
    }

    this.isSaving = true;
    this.error = null;
    this.successMessage = null;

    const policyToSave = {
      title: this.privacyPolicy.title.trim(),
      description: this.privacyPolicy.description.trim(),
      key: this.privacyPolicy.key
    };

    this.privacyPolicyService.createPrivacyPolicy(policyToSave).subscribe({
      next: () => {
        this.successMessage = 'Politique de confidentialité créée avec succès';
        this.isSaving = false;
        this.toost.success(this.successMessage);
        this.loadPrivacyPolicy(); 
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
    this.loadPrivacyPolicy(); 
    this.error = null;
    this.successMessage = null;
  }

  onEditorInit() {
    console.log('Éditeur initialisé');
  }
}