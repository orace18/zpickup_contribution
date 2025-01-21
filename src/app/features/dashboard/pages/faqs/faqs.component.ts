import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormsModule} from '@angular/forms';
import {FAQ} from './models/faqs.model';
import {FaqService} from './services/faqs.service';
import {Modal} from 'bootstrap';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-faqs',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.css'
})
export class FaqsComponent implements OnInit {
  faqs: FAQ[] = [];
  searchQuery: string = '';
  filteredFaqs: FAQ[] = [];
  loading: boolean = false;
  error: string | null = null;
  faqForm: FormGroup;
  submitting: boolean = false;
  modal: Modal | null = null;
  editingFaq: FAQ | null = null;
  editModal: Modal | null = null;

  constructor(
    private faqService: FaqService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private sanitizer: DomSanitizer
  ) {
    this.faqForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      youtube_video_link: ['']
    });
  }

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.loading = true;
    this.error = null;

    this.faqService.getFaqs().subscribe({
      next: (data) => {
        this.faqs = data.map(faq => ({...faq, isExpanded: false}));
        this.filteredFaqs = this.faqs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des FAQs:', error);
        this.error = 'Une erreur est survenue lors du chargement des FAQs.';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    if (!this.searchQuery.trim()) {
      this.filteredFaqs = this.faqs;
      return;
    }

    const searchTerm = this.searchQuery.toLowerCase();
    this.filteredFaqs = this.faqs.filter(faq =>
      faq.title.toLowerCase().includes(searchTerm) ||
      faq.description.toLowerCase().includes(searchTerm)
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Nouvelles méthodes pour la gestion du modal et des FAQs
  openAddModal() {
    this.faqForm.reset();
    this.modal = new Modal(document.getElementById('addFaqModal')!);
    this.modal.show();
  }

  onSubmit() {
    if (this.faqForm.valid && !this.submitting) {
      this.submitting = true;

      this.faqService.createFaq(this.faqForm.value).subscribe({
        next: (newFaq) => {
          this.faqs.unshift({...newFaq, isExpanded: false});
          this.applyFilters();
          this.modal?.hide();
          this.submitting = false;
          this.toast.success("FAQ crée avec succès!");
        },
        error: (error) => {
          console.error('Erreur lors de la création de la FAQ:', error);
          this.submitting = false;

        }
      });
    }
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    let videoId = '';

    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1];
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  toggleFaq(index: number) {
    this.filteredFaqs = this.filteredFaqs.map((faq, i) => ({
      ...faq,
      isExpanded: i === index ? !faq.isExpanded : faq.isExpanded
    }));
  }

  editFaq(faq: FAQ) {
    this.editingFaq = faq;
    this.faqForm.patchValue({
      title: faq.title,
      description: faq.description,
      youtube_video_link: faq.youtube_video_link
    });
    this.editModal = new Modal(document.getElementById('editFaqModal')!);
    this.editModal.show();
  }

  onEditSubmit() {
    if (this.faqForm.valid && !this.submitting && this.editingFaq) {
      this.submitting = true;

      this.faqService.updateFaq(this.editingFaq._id, this.faqForm.value).subscribe({
        next: (updatedFaq) => {
          const index = this.faqs.findIndex(f => f._id === this.editingFaq!._id);
          if (index !== -1) {
            this.faqs[index] = { ...updatedFaq, isExpanded: this.faqs[index].isExpanded };
            this.applyFilters();
          }
          this.editModal?.hide();
          this.submitting = false;
          this.editingFaq = null;
          this.toast.success("FAQ modifiée avec succès!");
        },
        error: (error) => {
          console.error('Erreur lors de la modification de la FAQ:', error);
          this.submitting = false;
          this.toast.error("Erreur lors de la modification de la FAQ");
        }
      });
    }
  }

  deleteFaq(faq: FAQ) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      this.faqService.deleteFaq(faq._id).subscribe({
        next: () => {
          this.faqs = this.faqs.filter(f => f._id !== faq._id);
          this.applyFilters();
          this.toast.success("FAQ supprimée avec succès!");
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la FAQ:', error);
          this.toast.error("Erreur lors de la suppression de la FAQ");
        }
      });
    }
  }

}
