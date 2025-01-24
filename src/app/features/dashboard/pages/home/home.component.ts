import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GraphiquesComponent } from "../../../../../shared/layouts/graphiques/graphiques.component";
import { AnalyticsService } from '../../../../../shared/layouts/graphiques/services/analityc.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, GraphiquesComponent],
  standalone: true
})
export class HomeComponent{
  inscriptionsChartData: any[] = [];
  racesChartData: any[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.inscriptionsChartData = data.inscriptions;
        this.racesChartData = data.races;
      },
      error: (err) => console.error('Erreur de chargement', err)
    });
  }

}
