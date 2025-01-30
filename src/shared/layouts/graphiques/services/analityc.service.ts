import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, forkJoin, map, tap } from "rxjs";
import { User } from "../../../../core/models/datatype.model";
import { Race } from "../../../../app/features/dashboard/pages/users/models/race.model";
import { environment } from "../../../../environments/environment";
import { UserMetrics,  InsuranceMetrics, AppMetrics, UserActivity, PendingValidations, Zem } from "../models/metric.model";

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

  /* getDashboardData(): Observable<any> {
    return forkJoin({
      inscriptions: this.getUserInscriptions(),
      races: this.getRacePerformance()
    });
  } */

 /*  private getUserInscriptions(): Observable<any[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      map(users => this.groupDataByMonth(users, 'created_at', 'Inscriptions'))
    );
  } */
  
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

/*   private getRacePerformance(): Observable<any[]> {
    return this.http.get<Race[]>(`${this.apiUrl}/races`, { headers: this.getHeaders() }).pipe(
      tap(races => console.log('Courses récupérées:', races)),
      map(races => this.groupDataByMonth(races, 'created_at' as keyof Race, 'Courses')),
      tap(result => console.log('Données de courses groupées:', result))
    );
  } */


  // Dans AnalyticsService
getDashboardData(startDate?: string, endDate?: string): Observable<any> {
  return forkJoin({
    inscriptions: this.getUserInscriptions(startDate, endDate),
    races: this.getRacePerformance(startDate, endDate)
  });
}

private getUserInscriptions(startDate?: string, endDate?: string): Observable<any[]> {
  return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
    map(users => {
      const filteredUsers = this.filterDataByDateRange(users, 'created_at', startDate, endDate);
      return this.groupDataByMonth(filteredUsers, 'created_at', 'Inscriptions');
    })
  );
}

private getRacePerformance(startDate?: string, endDate?: string): Observable<any[]> {
  return this.http.get<Race[]>(`${this.apiUrl}/races`, { headers: this.getHeaders() }).pipe(
    map(races => {
      const filteredRaces = this.filterDataByDateRange(races, 'created_at', startDate, endDate);
      return this.groupDataByMonth(filteredRaces, 'created_at', 'Courses');
    })
  );
}

private filterDataByDateRange<T>(
  data: T[],
  dateField: string,
  startDate?: string,
  endDate?: string
): T[] {
  if (!startDate || !endDate) return data;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filteredData = data.filter(item => {
    const itemDate = new Date((item as any)[dateField]);
    return itemDate >= start && itemDate <= end;
  });

  console.log('Données filtrées:', filteredData); // Ajoutez ce log
  return filteredData;
} 

// Nouvelles fonctions indépendantes
/* getUserMetrics(): Observable<UserMetrics> {
  return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
    map(users => {
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        totalUsers: users.length,
        totalZem: users.filter(user => user.user_type === 'zem').length,
        newUsersThisWeek: users.filter(user => new Date(user.create_at) >= weekStart).length,
        newUsersThisMonth: users.filter(user => new Date(user.create_at) >= monthStart).length
      };
    })
  );
} */

  /* getUserMetrics(): Observable<UserMetrics> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      map(users => {
        const now = new Date();
        
        // Début de la semaine (Lundi)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        
        // Début du mois
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
        return {
          totalUsers: users.length,
          totalZem: users.filter(user => user.user_type === 'zem').length,
          totalClients: users.filter(user => user.user_type === 'client').length,
          weeklyRegistrations: users.filter(user => new Date(user.created_at) >= weekStart).length,
          monthlyRegistrations: users.filter(user => new Date(user.created_at) >= monthStart).length
        };
      })
    );
  }
 */
/* getMotorcycleMetrics(): Observable<MotorcycleMetrics> {
  return this.http.get<any[]>(`${this.apiUrl}/motorcycles`, { headers: this.getHeaders() }).pipe(
    map(motorcycles => ({
      totalMotorcycles: motorcycles.length
    }))
  );
}
 */
/* getInsuranceMetrics(): Observable<InsuranceMetrics> {
  return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
    map(users => {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      return users.reduce((acc, user) => {
        if (!user.insurance_expiry) {
          acc.expired++;
          return acc;
        }
        
        const expiryDate = new Date(user.insurance_expiry);
        if (expiryDate <= now) {
          acc.expired++;
        } else if (expiryDate <= thirtyDaysFromNow) {
          acc.expiringSoon++;
        } else {
          acc.valid++;
        }
        return acc;
      }, { valid: 0, expired: 0, expiringSoon: 0 });
    })
  );
} */

/* getAppDownloads(): Observable<AppMetrics> {
  return this.http.get<AppMetrics>(`${this.apiUrl}/app-analytics`, { headers: this.getHeaders() });
} */

// Si vous voulez obtenir toutes les nouvelles métriques en une seule fois
/* getAllNewMetrics(): Observable<{

  motorcycles: MotorcycleMetrics;
  insurance: InsuranceMetrics;
  appDownloads: AppMetrics;
}> {
  return forkJoin({

    motorcycles: this.getMotorcycleMetrics(),
    insurance: this.getInsuranceMetrics(),
    appDownloads: this.getAppDownloads()
  });
} */

  getUserMetrics(): Observable<UserMetrics> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      map(users => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
        return {
          totalUsers: users.length || 0,
          totalZem: users.filter(user => user.user_type === 'zem').length || 0,
          totalClients: users.filter(user => user.user_type === 'customer').length || 0,
          weeklyRegistrations: users.filter(user => new Date(user.created_at) >= weekStart).length || 0,
          monthlyRegistrations: users.filter(user => new Date(user.created_at) >= monthStart).length || 0
        };
      })
    );
  }

  getAppDownloads(): Observable<AppMetrics> {
    return this.http.get<AppMetrics>(`${this.apiUrl}/app-analytics`, { headers: this.getHeaders() }).pipe(
      map(() => ({
        totalDownloads: 0,
        androidDownloads: 0,
        iosDownloads: 0
      }))
    );
  }

  getInsuranceMetrics(): Observable<InsuranceMetrics> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      map(users => ({
        valid: 0,
        expired: 0,
        expiringSoon: 0
      }))
    );
  }

  getPendingValidations(): Observable<PendingValidations> {     
    return this.http.get<Zem[]>(`${this.apiUrl}/zems`, { headers: this.getHeaders() }).pipe(       
      map(zems => {         
        // Filtrer les zems non validés         
        const pendingZems = zems.filter(zem =>            
          zem.profile_validation_status !== 'validated' && !zem.validated_at         
        );            
        
        // Compter les ZEM en attente          
        const pendingZem = pendingZems.length;             
              
        return {           
          zem: pendingZem,           
          documents: pendingZem,           
          total: pendingZems.length 
        };       
      })     
    );   
  }

  getUserActivity(): Observable<UserActivity> {
    return new Observable<UserActivity>(observer => {
      const metrics = {
        active: 0,
        inactive: 0,
        engagementRate: 0
      };
      observer.next(metrics);
      observer.complete();
    });
  }

}