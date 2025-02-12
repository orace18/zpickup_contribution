// configs.component.ts
import { Component, OnInit } from '@angular/core';
import { Config } from './models/config.model';
import { ConfigService } from './services/config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface ConfigWithState extends Config {
  originalValue?: string;
  isDirty?: boolean;
}

@Component({
  selector: 'app-configs',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './configs.component.html',
  styleUrl: './configs.component.css'
})
export class ConfigsComponent implements OnInit {
  configs: ConfigWithState[] = [];
  selectedIndex: number = -1;

  constructor(private configService: ConfigService, private toast: ToastrService) {}

  ngOnInit() {
    this.configService.getConfig().subscribe({
      next: (response: any) => {
        this.configs = response.map((config: Config) => ({
          ...config,
          originalValue: config.value,
          isDirty: false
        }));
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des configurations:', error);
      }
    });
  }

  toggleItem(index: number) {
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }

  onValueChange(index: number, newValue: string) {
    const config = this.configs[index];
    config.isDirty = newValue !== config.originalValue;
  }

  saveConfig(index: number) {
    const config = this.configs[index];
    const updateData: Partial<Config> = {
      key: config.key,
      value: config.value
    };
    
    this.configService.updateConfig(config._id,updateData).subscribe({
      next: () => {
        // Mise à jour de la valeur originale après succès
        config.originalValue = config.value;
        config.isDirty = false;
        this.toast.success('Configuration mise à jour')
        //console.log('Configuration sauvegardée avec succès');
      },
      error: (error) => {
        this.toast.error('Erreurlors mise à jour de la Configuration')

       // console.error('Erreur lors de la sauvegarde:', error);
      }
    });
  }

  resetConfig(index: number) {
    const config = this.configs[index];
    if (config.originalValue !== undefined) {
      config.value = config.originalValue;
      config.isDirty = false;
    }
  }
}