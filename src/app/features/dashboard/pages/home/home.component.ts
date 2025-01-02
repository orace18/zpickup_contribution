import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from './services/home.service';
import { User } from './models/users.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule, HttpClientModule],
  standalone: true
})
export class HomeComponent /*implements OnInit*/ {
 /* users: User[] = [];
  stats: any = { total: 0, customers: 0, zem: 0, admin: 0, lastUpdate: new Date() };
  registrationChart: Chart | undefined = undefined;
  userTypeChart: Chart | undefined = undefined;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.stats = this.userService.getUserStats(users);
      this.initCharts();
    });
  }

  private initCharts() {
    setTimeout(() => {
      this.createRegistrationChart();
      this.createUserTypeChart();
    });
  }

  private createRegistrationChart() {
    const ctx = document.getElementById('registrationChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas registrationChart non trouvé');
      return;
    }

    const monthlyData = this.userService.getMonthlyRegistrations(this.users);

    if (this.registrationChart) {
      this.registrationChart.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: monthlyData.map(([month]) => month),
        datasets: [{
          label: 'Nouvelles inscriptions',
          data: monthlyData.map(([_, count]) => count),
          borderColor: 'rgb(104,222,213)',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(75, 192, 192)',
          pointRadius: 4,
          pointHoverRadius: 6,
          cubicInterpolationMode: 'monotone'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution des inscriptions par mois',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    };

    this.registrationChart = new Chart(ctx, config);
  }

  private createUserTypeChart() {
    const ctx = document.getElementById('userTypeChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas userTypeChart non trouvé');
      return;
    }

    if (this.userTypeChart) {
      this.userTypeChart.destroy();
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: ['Clients', 'Zem', 'Admin'],
        datasets: [{
          data: [this.stats.customers, this.stats.zem, this.stats.admin],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)'
          ],
          borderWidth: 1,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Répartition des utilisateurs',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    };

    this.userTypeChart = new Chart(ctx, config);
  }

  ngOnDestroy() {
    if (this.registrationChart) {
      this.registrationChart.destroy();
    }
    if (this.userTypeChart) {
      this.userTypeChart.destroy();
    }
  }*/
}
