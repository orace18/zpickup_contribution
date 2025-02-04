import { Component, Input, OnChanges } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Race } from '../../../app/features/dashboard/pages/users/models/race.model';

@Component({
  selector: 'app-details-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './details-component.component.html',
  styleUrl: './details-component.component.css'
})
export class DetailsComponentComponent implements OnChanges{
  @Input() race?: Race;
  @Input() selectedUser: 'customer' | 'zem' = 'customer';

  getZemFullName(): string {
    return this.race?.zem 
      ? `${this.race.zem.firstname} ${this.race.zem.lastname}` 
      : 'Non assigné';
  }

  ngOnChanges() {
    console.log('Race reçue dans le composant de détails :', this.race);
  }
}
