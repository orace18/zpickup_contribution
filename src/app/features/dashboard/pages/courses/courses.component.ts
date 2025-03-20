import { Component, OnInit, ViewChild } from '@angular/core';
import { RaceHistoryService } from './services/race_history.service';
import { Race } from '../users/models/race.model'; // Assurez-vous que le chemin est correct
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailsComponentComponent } from '../../../../../shared/layouts/details-component/details-component.component';
import { FormsModule } from '@angular/forms';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import { LoadingComponent } from "../../../../../core/components/loading/loading.component";

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, NgbModule, NgbModalModule, FormsModule, DetailsComponentComponent, TableModule, LoadingComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
getNonCompletedRaces(): any[] {
throw new Error('Method not implemented.');
}

  races: Race[] = [];
  originalRaces: Race[] = [];
  isLoading = false;
  error: string | null = null;
  selectedRace: any;
  userType: any;
  searchQuery: any;
  startDate: Date | null = null;
  endDate: Date | null = null;
  today: string = new Date().toISOString().split('T')[0];
  loadingMessage: string = 'Chargement des données...';

  @ViewChild('historyModal') historyModal: any;
  @ViewChild('periodModal') periodModal: any;

  constructor(
    private raceHistoryService: RaceHistoryService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.loadRaces();
    }, 2000);
  }

  loadRaces() {
    this.isLoading = true;
    this.raceHistoryService.getRaces().subscribe({
      next: (data: Race[]) => {
        this.races = data;
        this.originalRaces = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Impossible de charger les courses';
        this.isLoading = false;
        console.error('Erreur de chargement', err);
      }
    });
  }

  voirDetails(race: Race) {
    console.log('Détails de la course:', race);
    this.selectedRace = race;
    this.userType = 'customer';
  }

  getLabel(status: string): string {
    switch(status) {
      case 'accepted': return 'Acceptée';
      case 'pending': return 'En attente';
      case 'start': return 'Démarrée';
      case 'stopped': return 'Arretée';
      case 'end': return 'Terminée';
      default: return status;
    }
  }

  applyDateFilter() {
    if (!this.startDate && !this.endDate) {
      this.races = [...this.originalRaces]; // Reset si aucune date
      return;
    }

    console.log('🚀 Début du filtrage');
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);

    // Conversion correcte des dates
    const startDateUTC = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;
    const endDateUTC = this.endDate ? new Date(this.endDate + 'T23:59:59.999Z') : null;

    console.log('Start Date (UTC):', startDateUTC ? startDateUTC.toISOString() : 'Non défini');
    console.log('End Date (UTC):', endDateUTC ? endDateUTC.toISOString() : 'Non défini');

    this.races = this.originalRaces.filter((race: Race) => {
      if (!race.created_at) {
        console.warn('⚠️ Course sans date:', race);
        return false;
      }

      const raceDate = new Date(race.created_at);
      if (isNaN(raceDate.getTime())) {
        console.warn('❌ Date invalide:', race.created_at);
        return false;
      }

      console.log('📅 Race Date:', raceDate.toISOString());

      const meetsStartCondition = !startDateUTC || raceDate >= startDateUTC;
      const meetsEndCondition = !endDateUTC || raceDate <= endDateUTC;

      console.log(`✅ ${raceDate.toISOString()} passe ?`, meetsStartCondition, meetsEndCondition);

      return meetsStartCondition && meetsEndCondition;
    });

    console.log('🎯 Courses après filtrage:', this.races.length);
  }

  exportToExcel() {
    // Convertir les données en format Excel
    const dataToExport = this.races.map(race => ({
      'Référence': race.reference,
      'Statut': this.getLabel(race.status),
      'Rue': race.street,
      'Localité': race.locality,
      'Pays': race.country,
      'Date': race.created_at ? new Date(race.created_at).toLocaleDateString() : ''
    }));
  
    // Création du workbook et worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');
    
    // Définition des largeurs de colonnes
    const wscols = [
      { wch: 12 }, // Référence
      { wch: 15 }, // Statut
      { wch: 30 }, // Rue
      { wch: 20 }, // Localité
      { wch: 15 }, // Pays
      { wch: 15 }  // Date
    ];
    worksheet['!cols'] = wscols;
    
    // Enregistrer le fichier avec BOM UTF-8 pour les caractères accentués
    XLSX.writeFile(workbook, 'courses.xlsx', { bookType: 'xlsx', type: 'buffer' });
  }
  exportToPdf() {
    // Créer un document PDF avec encodage correct
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // Ajouter un titre
    doc.setFont("helvetica"); // Police supportant mieux les caractères accentués
    doc.setFontSize(16);
    doc.text("Liste des courses", 14, 15);
    
    // Définir les colonnes et les données
    const columns = [
      { header: 'Réfrence', dataKey: 'ref' },
      { header: 'Statut', dataKey: 'status' },
      { header: 'Rue', dataKey: 'street' },
      { header: 'Localité', dataKey: 'locality' },
      { header: 'Pays', dataKey: 'country' }
    ];
    
    const data = this.races.map(race => ({
      ref: race.reference,
      status: this.getLabel(race.status),
      street: race.street,
      locality: race.locality,
      country: race.country
    }));
    
    // Générer le tableau avec autoTable
    (doc as any).autoTable({
      columns: columns,
      body: data,
      startY: 25,
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak' 
      },
      columnStyles: {
        street: { cellWidth: 'auto' },
        locality: { cellWidth: 'auto' }
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Enregistrer le PDF avec encodage UTF-8
    doc.save('courses.pdf');
  }

  exportToCsv() {
    // Générer un fichier CSV
    const headers = ['Référence', 'Statut', 'Rue', 'Localité', 'Pays'].join(',');
    
    // Échapper les virgules dans les données et remplacer les caractères qui peuvent causer des problèmes
    const csvData = this.races.map(race => {
      return [
        this.escapeCSVField(race.reference),
        this.escapeCSVField(this.getLabel(race.status)),
        this.escapeCSVField(race.street),
        this.escapeCSVField(race.locality),
        this.escapeCSVField(race.country)
      ].join(',');
    });
  
    // Ajouter BOM UTF-8 pour la prise en charge des caractères accentués
    const BOM = '\uFEFF';
    const csvContent = BOM + headers + '\n' + csvData.join('\n');
    
    // Créer le blob avec l'encodage UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Créer et déclencher le téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses.csv');
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
  

  private escapeCSVField(field: any): string {
    if (field === null || field === undefined) {
      return '';
    }
    
    const stringField = String(field);
    
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return '"' + stringField.replace(/"/g, '""') + '"';
    }
    
    return stringField;
  }


  openModal(template: any) {
    this.modalService.open(template, { centered: true, size: 'lg' });
  }

  resetDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.races = [...this.originalRaces]; 
  }
}