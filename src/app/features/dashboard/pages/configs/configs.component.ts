import { Component, OnInit } from '@angular/core';
import { Config } from './models/config.model';
import { ConfigService } from './services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configs',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './configs.component.html',
  styleUrl: './configs.component.css'
})
export class ConfigsComponent implements OnInit {
  configs: Config[] = [];
  selectedIndex: number = -1;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.configService.getConfig().subscribe({
      next: (response: any) => {
        this.configs = response;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des configurations:', error);
      }
    });
  }

  toggleItem(index: number) {
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }
}
