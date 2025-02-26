import { Component, OnInit, ViewChild } from '@angular/core';
import { RaceHistoryService } from './services/race_history.service';
import { RaceHistory } from './models/race.model';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DetailsComponentComponent } from '../../../../../shared/layouts/details-component/details-component.component';
import { FormsModule } from '@angular/forms';
import { jsPDF } from "jspdf";
import  'jspdf-autotable';
import { map } from 'rxjs';
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

  raceHistories: RaceHistory[] = [];
  originalRaceHistories: RaceHistory[] = [];
  isLoading = false;
  error: string | null = null;
  selectedRace: any;
  userType: any;
  searchQuery: any;
  startDate: Date | null = null;
  endDate: Date | null = null;
  today: string = new Date().toISOString().split('T')[0];
  loadingMessage: string = 'Chargement des données...';

  constructor(
    private raceHistoryService: RaceHistoryService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.loadRaceHistory();
    }, 2000);
  }

  loadRaceHistory() {
    this.isLoading = true;
    this.raceHistoryService.getRaceHistory().subscribe({
      next: (data) => {
        this.raceHistories = data;
        this.originalRaceHistories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger l\'historique des courses';
        this.isLoading = false;
        console.error('Erreur de chargement', err);
      }
    });
  }

  voirDetails(histoire: RaceHistory) {
    console.log('Détails de la course:', histoire);
    this.selectedRace = histoire.race;
    console.log("Détails de la course avec la race:", histoire.race);
    this.userType = 'customer';
  }
 

  getLabel(status: string): string {
    switch(status) {
      case 'accepted': return 'Acceptée';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejetée';
      case 'start': return 'Démarrée';
      default: return status;
    }
  }

  // Ajouter ces propriétés à la classe


applyDateFilter() {
  if (!this.startDate && !this.endDate) {
    this.raceHistories = [...this.originalRaceHistories]; // Reset si aucune date
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

  this.raceHistories = this.originalRaceHistories.filter((race: RaceHistory) => {
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

  console.log('🎯 Historiques après filtrage:', this.raceHistories.length);
}


@ViewChild('historyModal') historyModal: any;
@ViewChild('periodModal') periodModal: any;



exportToExcel() {
  // Convertir les données en format Excel
  const dataToExport = this.raceHistories.map(race => ({
    'Référence': race.otherRaceData?.reference,
    'Statut': this.getLabel(race.status),
    'Rue': race.street,
    'Localité': race.locality,
    'Pays': race.country
  }));

  // Utilisez une bibliothèque comme xlsx
  // import * as XLSX from 'xlsx';
  // const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');
  // XLSX.writeFile(workbook, 'historique_courses.xlsx');
}

exportToPdf() {
  // Utilisez jspdf ou une autre bibliothèque PDF
 
  
  const doc = new jsPDF();
  const columns = ['N°', 'Statut', 'Rue', 'Localité', 'Pays'];
  const data = this.raceHistories.map(race => [
    race.otherRaceData?.reference,
    this.getLabel(race.status),
    race.street,
    race.locality,
    race.country
  ]);
  
 // doc.autoTable({ columns, body: data });
  doc.save('historique_courses.pdf');
}

exportToCsv() {
  // Générer un fichier CSV
  const headers = ['N°', 'Statut', 'Rue', 'Localité', 'Pays'].join(',');
  const csvData = this.raceHistories.map(race => 
    [
      race.otherRaceData?.reference,
      this.getLabel(race.status),
      race.street,
      race.locality,
      race.country
    ].join(',')
  );

  const csvContent = headers + '\n' + csvData.join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'historique_courses.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

openModal(template: any) {
  this.modalService.open(template, { centered: true, size: 'lg' });
}

resetDateFilter() {
  this.startDate = null;
  this.endDate = null;
  this.raceHistories = [...this.originalRaceHistories]; 
}
  
}