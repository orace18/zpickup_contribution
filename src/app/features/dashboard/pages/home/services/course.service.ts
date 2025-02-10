import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { Course, CourseStats } from '../models/course.model';


@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = environment.apiUrl + "/courses";
  private monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCourseStats(courses: Course[]): CourseStats {
    const total = courses.length;
    const completed = courses.filter(c => c.status === 'completed').length;
    const cancelled = courses.filter(c => c.status === 'cancelled').length;

    const lastUpdate = courses.reduce((latest, course) => {
      const courseDate = new Date(course.created_at);
      return courseDate > latest ? courseDate : latest;
    }, new Date(0));

    return { total, completed, cancelled, lastUpdate };
  }

  getMonthlyCourses(courses: Course[]): [string, number][] {
    // Créer un Map pour stocker les données mensuelles
    const monthlyData = new Map<string, number>();

    // Obtenir la date actuelle
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Ne compter que les courses complétées
    courses
      .filter(course => course.status === 'completed')
      .forEach(course => {
        const createdDate = new Date(course.created_at);
        const monthYear = `${this.monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
        monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
      });

    // Obtenir les dates limites
    const dates = courses.map(course => new Date(course.created_at));
    const oldestDate = dates.length > 0 ? 
      new Date(Math.min(...dates.map(d => d.getTime()))) : 
      new Date(currentYear, currentMonth - 11, 1);

    // S'assurer que oldestDate n'est pas après aujourd'hui
    if (oldestDate > currentDate) {
      oldestDate.setFullYear(currentDate.getFullYear() - 1);
    }

    // Créer un tableau avec tous les mois jusqu'au mois actuel
    const allMonths: [string, number][] = [];
    let iterDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);

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