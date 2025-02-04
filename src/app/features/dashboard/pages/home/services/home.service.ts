import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/users.model';
import { environment } from '../../../../../../environments/environment';

interface UserStats {
  total: number;
  customers: number;
  zem: number;
  admin: number;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + "/users";
  private monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserStats(users: User[]): UserStats {
    const total = users.length;
    const customers = users.filter(u => u.user_type === 'customer').length;
    const zem = users.filter(u => u.user_type === 'zem').length;
    const admin = users.filter(u => u.user_type === 'admin').length;

    const lastUpdate = users.reduce((latest, user) => {
      if (!user.validated_at) return latest;
      const validatedDate = new Date(user.validated_at);
      return validatedDate > latest ? validatedDate : latest;
    }, new Date(0));

    return { total, customers, zem, admin, lastUpdate };
  }

  getMonthlyRegistrations(users: User[]): [string, number][] {
    // Créer un Map pour stocker les données mensuelles
    const monthlyData = new Map<string, number>();

    // Obtenir la date actuelle
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Traiter chaque utilisateur
    users.forEach(user => {
      const createdDate = new Date(user.created_at);
      const monthYear = `${this.monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
      monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
    });

    // Obtenir les dates limites
    const dates = users.map(user => new Date(user.created_at));
    const oldestDate = dates.length > 0 ? 
      new Date(Math.min(...dates.map(d => d.getTime()))) : 
      new Date(currentYear, currentMonth - 11, 1); // Défaut à 12 mois en arrière

    // S'assurer que oldestDate n'est pas après aujourd'hui
    if (oldestDate > currentDate) {
      oldestDate.setFullYear(currentDate.getFullYear() - 1);
    }

    // Créer un tableau avec tous les mois, y compris le mois actuel
    const allMonths: [string, number][] = [];
    let iterDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);

    // Continuer jusqu'au mois actuel inclus
    while (
      iterDate.getFullYear() < currentYear || 
      (iterDate.getFullYear() === currentYear && iterDate.getMonth() <= currentMonth)
    ) {
      const monthYear = `${this.monthNames[iterDate.getMonth()]} ${iterDate.getFullYear()}`;
      allMonths.push([monthYear, monthlyData.get(monthYear) || 0]);
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    // Trier les mois par ordre chronologique
    allMonths.sort((a, b) => {
      const [monthA, yearA] = this.parseMonthYear(a[0]);
      const [monthB, yearB] = this.parseMonthYear(b[0]);
      
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      return monthA - monthB;
    });

    return allMonths;
  }

  private parseMonthYear(monthYear: string): [number, number] {
    const [month, year] = monthYear.split(' ');
    return [this.monthNames.indexOf(month), parseInt(year)];
  }
}