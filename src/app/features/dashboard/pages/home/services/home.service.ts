/* import { Injectable } from '@angular/core';
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

    // Initialiser avec le mois actuel (même s'il n'y a pas encore d'inscriptions)
    const currentMonthKey = `${this.monthNames[currentMonth]} ${currentYear}`;
    monthlyData.set(currentMonthKey, 0);

    // Traiter chaque utilisateur
    users.forEach(user => {
      const createdDate = new Date(user.created_at);
      const monthYear = `${this.monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
      monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
    });

    // Déterminer la période à afficher (12 derniers mois)
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);

    // Créer un tableau avec tous les mois des 12 derniers mois
    const allMonths: [string, number][] = [];
    let iterDate = new Date(startDate);

    while (iterDate <= currentDate) {
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
} */


/*   
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/users.model';

import { environment } from '../../../../../../environments/environment';
import { Race } from '../../users/models/race.model';

interface UserStats {
  total: number;
  customers: number;
  zem: number;
  admin: number;
  lastUpdate: Date;
}

interface MonthlyStats {
  users: [string, number][];
  races: [string, number][];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getRaces(): Observable<Race[]> {
    return this.http.get<Race[]>(`${this.apiUrl}/races`);
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

  getAllMonthlyStats(users: User[], races: Race[]): MonthlyStats {
    return {
      users: this.getMonthlyRegistrations(users),
      races: this.getMonthlyRaces(races)
    };
  }

  getMonthlyRegistrations(users: User[]): [string, number][] {
    return this.getMonthlyStats(users, 'created_at');
  }

  getMonthlyRaces(races: Race[]): [string, number][] {
    return this.getMonthlyStats(races, 'created_at');
  }

  private getMonthlyStats<T>(items: T[], dateField: keyof T): [string, number][] {
    // Créer un Map pour stocker les données mensuelles
    const monthlyData = new Map<string, number>();

    // Obtenir la date actuelle
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Initialiser avec le mois actuel (même s'il n'y a pas encore de données)
    const currentMonthKey = `${this.monthNames[currentMonth]} ${currentYear}`;
    monthlyData.set(currentMonthKey, 0);

    // Traiter chaque élément
    items.forEach(item => {
      const itemDate = new Date(item[dateField] as string);
      const monthYear = `${this.monthNames[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
      monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
    });

    // Déterminer la période à afficher (12 derniers mois)
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);

    // Créer un tableau avec tous les mois des 12 derniers mois
    const allMonths: [string, number][] = [];
    let iterDate = new Date(startDate);

    while (iterDate <= currentDate) {
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
} */

  import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/users.model';

import { environment } from '../../../../../../environments/environment';
import { Race } from '../../users/models/race.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  private apiUrl = environment.apiUrl;
  private monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(userId: string) {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  getRaces(): Observable<Race[]> {
    return this.http.get<Race[]>(`${this.apiUrl}/races`);
  }

  getMonthlyRegistrations(users: User[]): [string, number][] {
    return this.processMonthlyData(users, 'created_at');
  }

  getMonthlyRaces(races: Race[]): [string, number][] {
    return this.processMonthlyData(races, 'created_at', true);
  }

  private processMonthlyData<T>(items: T[], dateField: keyof T, isRace: boolean = false): [string, number][] {
    // Créer un Map pour stocker les données mensuelles
    const monthlyData = new Map<string, number>();

    // Obtenir la date actuelle
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Initialiser explicitement le mois courant à 0
    const currentMonthKey = `${this.monthNames[currentMonth]} ${currentYear}`;
    monthlyData.set(currentMonthKey, 0);

    // Traiter chaque élément
    items.forEach(item => {
      const itemDate = new Date(item[dateField] as string);
      // Ne compter que si la date est valide
      if (!isNaN(itemDate.getTime())) {
        const monthYear = `${this.monthNames[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
        
        // Pour les courses du mois courant, vérifier si c'est bien ce mois-ci
        if (isRace && 
            itemDate.getMonth() === currentDate.getMonth() && 
            itemDate.getFullYear() === currentDate.getFullYear()) {
          monthlyData.set(currentMonthKey, (monthlyData.get(currentMonthKey) || 0) + 1);
        } else {
          monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
        }
      }
    });

    // Créer un tableau avec les 12 derniers mois
    const allMonths: [string, number][] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthYear = `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
      allMonths.push([monthYear, monthlyData.get(monthYear) || 0]);
    }

    return allMonths;
  }

  private parseMonthYear(monthYear: string): [number, number] {
    const [month, year] = monthYear.split(' ');
    return [this.monthNames.indexOf(month), parseInt(year)];
  }
}