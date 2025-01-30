import { AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GraphiquesComponent } from "../../../../../shared/layouts/graphiques/graphiques.component";
import { AnalyticsService } from '../../../../../shared/layouts/graphiques/services/analityc.service';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import * as Papa from 'papaparse';
import 'jspdf-autotable';
import { InsuranceMetrics, PendingValidations, UserActivity } from '../../../../../shared/layouts/graphiques/models/metric.model';


interface UserMetrics {
  totalUsers?: number;
  totalZem?: number;
  totalClients?: number;
}

interface ExportDataItem {
  Mois: string;
  Inscriptions: number;
  Courses: number;
}

interface AppMetrics {

  totalDownloads: number;

  androidDownloads: number;

  iosDownloads: number;

}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, GraphiquesComponent, ReactiveFormsModule, FormsModule],
  standalone: true
})

export class HomeComponent implements OnInit, AfterViewInit {


  inscriptionsChartData: any[] = [];
  racesChartData: any[] = [];
  dateForm: FormGroup;
  private modalInstance: any;
  userMetrics!: UserMetrics;
  appMetrics!: AppMetrics;
  insuranceMetrics!: InsuranceMetrics;
  pendingValidations!: PendingValidations;
  userActivity!: UserActivity;

  constructor(
    private analyticsService: AnalyticsService,
    private fb: FormBuilder,
  ) {
    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  @Output() dateRangeSelected = new EventEmitter<{startDate: string, endDate: string}>();



  ngOnInit() {
    this.loadAllMetrics();
    this.loadDashboardData();
  }

    private loadDashboardData(startDate?: string, endDate?: string) {
      this.analyticsService.getDashboardData(startDate, endDate).subscribe({
        next: (data) => {
          console.log('Données reçues:', data);
          this.inscriptionsChartData = [...data.inscriptions]; // Nouvelle référence
          this.racesChartData = [...data.races]; // Nouvelle référence
        },
        error: (err) => console.error('Erreur de chargement', err)
      });
    }

    /* private loadUserMetrics() {
      this.analyticsService.getUserMetrics().subscribe({
        next: (metrics) => {
          this.userMetrics = metrics;
        },
        error: (err) => console.error('Erreur lors du chargement des métriques:', err)
      });
    } */

      private loadAllMetrics() {
        // Charger les métriques utilisateurs
        this.analyticsService.getUserMetrics().subscribe({
          next: (metrics) => this.userMetrics = metrics,
          error: (err) => console.error('Erreur métriques utilisateurs:', err)
        });
    
        // Charger les métriques de l'application
        this.analyticsService.getAppDownloads().subscribe({
          next: (metrics) => this.appMetrics = metrics,
          error: (err) => console.error('Erreur métriques app:', err)
        });
    
        // Charger les métriques d'assurance
        this.analyticsService.getInsuranceMetrics().subscribe({
          next: (metrics) => this.insuranceMetrics = metrics,
          error: (err) => console.error('Erreur métriques assurance:', err)
        });
    
        // Charger les validations en attente
        this.analyticsService.getPendingValidations().subscribe({
          next: (metrics) => this.pendingValidations = metrics,
          error: (err) => console.error('Erreur validations en attente:', err)
        });
    
        // Charger l'activité des utilisateurs
        this.analyticsService.getUserActivity().subscribe({
          next: (metrics) => this.userActivity = metrics,
          error: (err) => console.error('Erreur activité utilisateurs:', err)
        });
      }

  ngAfterViewInit() {
    const modalElement = document.getElementById('kt_modal_select_period');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
  
      // Réinitialiser le modal après fermeture
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.hideOverlay();
      });
    }
  }

  onSubmit() {
    if (this.dateForm.valid) {
      const { startDate, endDate } = this.dateForm.value;
      this.loadDashboardData(startDate, endDate);
      this.dateRangeSelected.emit({ startDate, endDate });
      this.modalInstance?.hide();
      
      // Nettoyer l'arrière-plan
      this.hideOverlay();
    }
  }

  // Ajoutez une méthode pour réinitialiser les filtres si nécessaire
  resetFilters() {
    this.dateForm.reset();
    this.loadDashboardData();
  }

  openModal() {
    const dateModal = new bootstrap.Modal(document.getElementById('kt_modal_select_period')!);
       dateModal.show();
   }

   @HostListener('document:click', ['$event'])
    handleCloseClick(event: MouseEvent) {
      const closeButton = document.querySelector('[data-bs-dismiss="modal"]');
      const cancelButton = document.querySelector('[data-kt-users-modal-action="cancel"]');
      const modal = document.getElementById('kt_modal_select_period');

      if (event.target === closeButton || event.target === cancelButton || event.target === modal) {
        this.hideOverlay();
      }
    }

    private hideOverlay(): void {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto'; // Réactiver le défilement
    }

    exportToCsv() {
      const data = this.prepareDataForExport();
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    exportToPdf(): void {
      try {
        const doc = new jsPDF();
        
        // Configuration du document
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        
        // Titre centré
        const title = 'Rapport des données';
        const titleWidth = doc.getTextWidth(title);
        const pageWidth = doc.internal.pageSize.width;
        doc.text(title, (pageWidth - titleWidth) / 2, 15);
        
        const headers = [['Mois', 'Inscriptions', 'Courses']];
        const data = this.prepareDataForExport();
        
        // Formatage des données avec les nombres localisés
        const rows = data.map(item => [
          item.Mois,
          item.Inscriptions.toLocaleString(),
          item.Courses.toLocaleString()
        ]);
        
        // Configuration et génération du tableau
        (doc as any).autoTable({
          head: headers,
          body: rows,
          startY: 25,
          theme: 'striped',
          styles: {
            fontSize: 12,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 60 }, // Colonne Mois
            1: { cellWidth: 'auto', halign: 'right' }, // Colonne Inscriptions
            2: { cellWidth: 'auto', halign: 'right' }  // Colonne Courses
          },
          didDrawPage: (data: any) => {
            // Pied de page avec numéro de page
            const pageCount = doc.internal.pages.length - 1;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(
              `Page ${pageCount}`,
              doc.internal.pageSize.width - 20,
              doc.internal.pageSize.height - 10
            );
          },
          didParseCell: (data: any) => {
            // Style spécial pour la ligne des totaux
            if (data.row.cells[0]?.raw === 'Total') {
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });
        
        // Générer le nom du fichier avec la date
        const date = new Date().toISOString().split('T')[0];
        const filename = `rapport-donnees-${date}.pdf`;
        
        doc.save(filename);
        
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        
      }
    }
  
    exportToExcel() {
      const data = this.prepareDataForExport();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, 'export.xlsx');
    }

    

    private prepareDataForExport(): ExportDataItem[] {
      let exportData: ExportDataItem[] = [];
    
      // Si nous avons des données d'inscriptions
      if (this.inscriptionsChartData && this.inscriptionsChartData.length > 0) {
        const inscriptionSeries = this.inscriptionsChartData[0].series;
        const racesSeries = this.racesChartData[0]?.series || [];
    
        // Combiner les données pour chaque mois
        inscriptionSeries.forEach((item: any, index: number) => {
          const raceData = racesSeries[index] || { value: 0 };
          
          exportData.push({
            Mois: item.name,
            Inscriptions: item.value,
            Courses: raceData.value,
          });
        });
      }
    
      // Ajouter des totaux à la fin
      const totalInscriptions = exportData.reduce((sum, item) => sum + item.Inscriptions, 0);
      const totalCourses = exportData.reduce((sum, item) => sum + item.Courses, 0);
    
      exportData.push({
        Mois: 'Total',
        Inscriptions: totalInscriptions,
        Courses: totalCourses,
      });
    
      return exportData;
    }
}