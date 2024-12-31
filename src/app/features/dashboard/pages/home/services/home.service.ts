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

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserStats(users: User[]): UserStats {
    const total = users.length;
    const customers = users.filter(u => u.user_type === 'customer').length;
    const zem = users.filter(u => u.user_type === 'zem').length;
    const admin = users.filter(u => u.user_type === 'admin').length;

    // Trouver la date de validation la plus récente
    const lastUpdate = users.reduce((latest, user) => {
      if (!user.validated_at) return latest;
      const validatedDate = new Date(user.validated_at);
      return validatedDate > latest ? validatedDate : latest;
    }, new Date(0));

    return { total, customers, zem, admin, lastUpdate };
  }

  getMonthlyRegistrations(users: User[]): [string, number][] {
    const monthlyData = new Map<string, number>();

    // Créer un tableau des noms de mois en français
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    users.forEach(user => {
      const date = new Date(user.created_at);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
    });

    // Obtenir la date la plus ancienne et la plus récente
    const dates = users.map(user => new Date(user.created_at));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Créer un tableau de tous les mois entre la plus ancienne et la plus récente date
    const allMonths: [string, number][] = [];
    let currentDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);

    while (currentDate <= newestDate) {
      const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      allMonths.push([monthYear, monthlyData.get(monthYear) || 0]);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return allMonths;
  }
}
