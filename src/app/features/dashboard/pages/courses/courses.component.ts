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
hasFilteredResults(): any {
throw new Error('Method not implemented.');
}
  races: Race[] = [];
  originalRaces: Race[] = [];
  filteredRaces: Race[] = []; // Nouveau tableau pour les résultats filtrés
  isLoading = false;
  error: string | null = null;
  selectedRace: any;
  userType: any;
  searchTerm: string = ''; // Terme de recherche
  startDate: Date | null = null;
  endDate: Date | null = null;
  today: string = new Date().toISOString().split('T')[0];
  loadingMessage: string = 'Chargement des données...';
  activeTab: string = 'all-courses'; // Pour suivre l'onglet actif

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
        this.originalRaces = data;
        this.races = data;
        this.filteredRaces = data; // Initialiser filteredRaces avec toutes les courses
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Impossible de charger les courses';
        this.isLoading = false;
        console.error('Erreur de chargement', err);
      }
    });
  }

  // Méthode pour filtrer les courses selon le terme de recherche
  applySearch(): void {
    this.filterRaces();
  }

  // Méthode pour effacer la recherche
  clearSearch(): void {
    this.searchTerm = '';
    this.filterRaces();
  }

  // Méthode combinée pour filtrer selon la date et le terme de recherche
  filterRaces(): void {
    // Début avec toutes les courses originales
    let result = [...this.originalRaces];
    
    // Appliquer le filtre de date si défini
    if (this.startDate || this.endDate) {
      const startDateUTC = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;
      const endDateUTC = this.endDate ? new Date(this.endDate + 'T23:59:59.999Z') : null;
      
      result = result.filter((race: Race) => {
        if (!race.created_at) return false;
        
        const raceDate = new Date(race.created_at);
        if (isNaN(raceDate.getTime())) return false;
        
        const meetsStartCondition = !startDateUTC || raceDate >= startDateUTC;
        const meetsEndCondition = !endDateUTC || raceDate <= endDateUTC;
        
        return meetsStartCondition && meetsEndCondition;
      });
    }
    
    // Appliquer le filtre de recherche si défini
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(race => 
        (race.reference && race.reference.toLowerCase().includes(term)) ||
        (race.street && race.street.toLowerCase().includes(term)) ||
        (race.locality && race.locality.toLowerCase().includes(term)) ||
        (race.country && race.country.toLowerCase().includes(term)) ||
        this.getLabel(race.status).toLowerCase().includes(term)
      );
    }
    
    // Mettre à jour les courses filtrées
    this.filteredRaces = result;
    console.log(`🔍 Filtrage: ${this.filteredRaces.length} courses trouvées`);
  }

  // Méthode pour obtenir les courses non terminées
  getNonCompletedRaces(): Race[] {
    return this.filteredRaces.filter(race => 
      race.status !== 'end' && race.status !== 'stopped'
    );
  }

  isRaceCountChanged(): boolean {
    return this.getNonCompletedRaces().length !== this.originalRaces.filter(r => r.status !== 'end' && r.status !== 'stopped').length;
  }

  // Méthode pour changer d'onglet
  changeTab(tabId: string) {
    this.activeTab = tabId;
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
    this.filterRaces(); // Utiliser la méthode combinée
  }

  resetDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filterRaces(); // Réappliquer les filtres (juste la recherche maintenant)
  }

  exportToExcel() {
    // Déterminer quelles données exporter selon l'onglet actif
    const dataToExport = this.activeTab === 'all-courses' ? this.filteredRaces : this.getNonCompletedRaces();
    
    // Convertir les données en format Excel
    const mappedData = dataToExport.map(race => ({
      'Référence': race.reference,
      'Statut': this.getLabel(race.status),
      'Rue': race.street,
      'Localité': race.locality,
      'Pays': race.country,
      'Date': race.created_at ? new Date(race.created_at).toLocaleDateString() : ''
    }));
  
    // Création du workbook et worksheet
    const worksheet = XLSX.utils.json_to_sheet(mappedData);
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
    // Déterminer quelles données exporter selon l'onglet actif
    const dataToExport = this.activeTab === 'all-courses' ? this.filteredRaces : this.getNonCompletedRaces();
    
    // Créer un document PDF avec encodage correct
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // Ajouter un titre
    const title = this.activeTab === 'all-courses' ? "Liste des courses" : "Liste des courses non terminées";
    doc.setFont("helvetica"); // Police supportant mieux les caractères accentués
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Définir les colonnes et les données
    const columns = [
      { header: 'Réfrence', dataKey: 'ref' },
      { header: 'Statut', dataKey: 'status' },
      { header: 'Rue', dataKey: 'street' },
      { header: 'Localité', dataKey: 'locality' },
      { header: 'Pays', dataKey: 'country' }
    ];
    
    const data = dataToExport.map(race => ({
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
    
    // Nom du fichier PDF selon l'onglet actif
    const fileName = this.activeTab === 'all-courses' ? 'courses.pdf' : 'courses-non-terminees.pdf';
    
    // Enregistrer le PDF avec encodage UTF-8
    doc.save(fileName);
  }

  exportToCsv() {
    // Déterminer quelles données exporter selon l'onglet actif
    const dataToExport = this.activeTab === 'all-courses' ? this.filteredRaces : this.getNonCompletedRaces();
    
    // Générer un fichier CSV
    const headers = ['Référence', 'Statut', 'Rue', 'Localité', 'Pays'].join(',');
    
    // Échapper les virgules dans les données et remplacer les caractères qui peuvent causer des problèmes
    const csvData = dataToExport.map(race => {
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
    
    // Nom du fichier CSV selon l'onglet actif
    const fileName = this.activeTab === 'all-courses' ? 'courses.csv' : 'courses-non-terminees.csv';
    
    // Créer et déclencher le téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
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



  openDetailsInNewTab(race: Race) {
    const url = `/race-details/${race._id}`;
    window.open(url, '_blank');
  }
}