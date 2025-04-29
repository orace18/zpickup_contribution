import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { colorSets } from '@swimlane/ngx-charts';
import { curveCardinal } from 'd3-shape';

interface DataPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-graphiques',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './graphiques.component.html',
  styleUrl: './graphiques.component.css'
})
export class GraphiquesComponent implements OnChanges {
  curve = curveCardinal;

  @Input() data: any[] = [];
  @Input() xLabel = 'Période';
  @Input() yLabel = 'Valeur';

  chartData: any[] = [];
  customColors = [
    {
      name: 'Courses',
      value: '#FF6B6B'
    },
    {
      name: 'Inscriptions',
      value: '#796CE7'
    }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      console.log('Données reçues dans ngOnChanges:', this.data); // Ajoutez ce log
      this.chartData = this.data.map(series => ({
        name: series.name,
        series: series.series || series
      }));
    }
  }
}