import { Component, Input, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { colorSets } from '@swimlane/ngx-charts';

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
export class GraphiquesComponent implements OnInit {
 

  
  customColorScheme = {
    domain: ['#FF0000', '#00FF00', '#0000FF'] 
  };

  @Input() data: any[] = [];
  @Input() xLabel = 'Période';
  @Input() yLabel = 'Valeur';

  chartData: any[] = [];
customColors: { domain: string[
  ] } = { domain: ['#796CE7', '#00FF00', '#0000FF'
] };

  ngOnInit() {
    
    if (this.data && this.data.length > 0) {
      this.chartData = this.data.map(series => ({
        name: series.name,
        series: series.series || series
      }));
    }
  }
}
