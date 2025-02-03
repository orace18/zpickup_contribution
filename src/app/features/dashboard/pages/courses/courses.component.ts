import { Component, OnInit } from '@angular/core';
import { RaceHistoryService } from './services/race_history.service';
import { RaceHistory } from './models/race.model';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  raceHistories: RaceHistory[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private raceHistoryService: RaceHistoryService
  ) {}

  ngOnInit(): void {
    this.loadRaceHistory();
  }

  loadRaceHistory() {
    this.isLoading = true;
    this.raceHistoryService.getRaceHistory().subscribe({
      next: (data) => {
        this.raceHistories = data;
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
  }

  getLabel(status: string): string {
    switch(status) {
      case 'accepted': return 'Accepté';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  }
}