import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  // Définir les données et options du graphique
  public barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55],
        label: 'Ventes'
      }
    ]
  };

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Ventes'
        }
      }
    }
  };

  public barChartLegend = true;
  public barChartType: ChartType = 'bar';  // Type de graphique, ici un graphique à barres

  constructor() {}

  ngOnInit(): void {
    // Logique d'initialisation, si nécessaire
  }
}
