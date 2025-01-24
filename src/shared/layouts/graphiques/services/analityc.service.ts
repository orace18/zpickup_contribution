import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, forkJoin, map, tap } from "rxjs";
import { User } from "../../../../core/models/datatype.model";
import { Race } from "../../../../app/features/dashboard/pages/users/models/race.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private monthOrder = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private http: HttpClient
  ) {}

  private apiUrl = environment.apiUrl ;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDashboardData(): Observable<any> {
    return forkJoin({
      inscriptions: this.getUserInscriptions(),
      races: this.getRacePerformance()
    });
  }

  private getUserInscriptions(): Observable<any[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      map(users => this.groupDataByMonth(users, 'created_at', 'Inscriptions'))
    );
  }
  
  private groupDataByMonth<T>(
    data: T[], 
    dateField: string, 
    seriesName: string
  ): any[] {
    const groupedData = data.reduce((acc, item) => {
      const date = new Date((item as any)[dateField]);
      const month = date.toLocaleString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    return [{
      name: seriesName,
      series: this.monthOrder
        .map(month => ({ 
          name: month, 
          value: groupedData[month] || 0  
        }))
    }];
  }

  private getRacePerformance(): Observable<any[]> {
    return this.http.get<Race[]>(`${this.apiUrl}/races`, { headers: this.getHeaders() }).pipe(
      tap(races => console.log('Courses récupérées:', races)),
      map(races => this.groupDataByMonth(races, 'created_at' as keyof Race, 'Courses')),
      tap(result => console.log('Données de courses groupées:', result))
    );
  }

 
}