import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { FinancialCard } from './models/gains.model';
import { GainsService } from './services/gains.service';

@Component({
  selector: 'app-gains',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule
  ],
  templateUrl: './gains.component.html',
  styleUrl: './gains.component.css',
})
export class GainsComponent implements OnInit {
  constructor(
    public gainsService: GainsService
  ) {}

  cards: FinancialCard[] = [
    {
      title: 'Gain Client',
      amount: 0,
      icon: 'user-square',
      color: 'primary'
    }
    ,
    {
      title: 'Gain ZPickup',
      amount: 0,
      icon: 'defender',
      color: 'success'
    },
    {
      title: 'Gain Transporteur',
      amount: 0,
      icon: 'delivery',
      color: 'warning'
    }
  ];

  financialData: any[] = [
    { date: new Date(), type: 'Bonus', amount: 20, status: 'Disponible' },
    { date: new Date(), type: 'Recharge', amount: 500, status: 'Disponible' },
    { date: new Date(), type: 'Bonus', amount: 20, status: 'Disponible' }
  ];

  ngOnInit(): void {
    console.log('Gains component initialized');
    this.gainsService.getZemRaces().subscribe(
      gains => {
        if (gains && typeof gains === 'object') {
          this.cards[0].amount = Number(gains.customer_bonus) || 0;
          this.cards[2].amount = Number(gains.zem_bonus) || 0;
          this.cards[1].amount = Number(gains.admin_bonus) || 0;
        } else {
          console.error('Invalid gains data:', gains);
        }
      },
      error => {
        console.error('Error in ngOnInit:', error);
      }
    );
  }
}