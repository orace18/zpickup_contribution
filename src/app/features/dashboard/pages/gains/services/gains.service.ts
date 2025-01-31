import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";
import { Observable, catchError, forkJoin, map, of, tap } from "rxjs";
import { Race } from "../../users/models/race.model";
import { Injectable } from "@angular/core";

export interface GainsResult {
  zem_bonus: number;
  customer_bonus: number;
  admin_bonus: number;
  total: number;
}


@Injectable({
  providedIn: 'root'
})
export class GainsService {
  private apiUrl = environment.apiUrl + '/races';

  constructor(private http: HttpClient) {}

  getRaces(): Observable<Race[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return this.http.get<Race[]>(this.apiUrl, { headers }).pipe(
      tap(races => console.log('Races received:', races)), // Affichez les données reçues
      catchError(error => {
        console.error('Error fetching races:', error); // Affichez les erreurs
        return of([]); // Retournez un tableau vide en cas d'erreur
      })
    );
  }

  getZemRaces() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
  
    return this.getRaces().pipe(
      map(races => {
        return {
          zem_bonus: Number((races.reduce((sum, race) => sum + (race.zem_bonus || 0), 0)).toFixed(2)),
          customer_bonus: Number((races.reduce((sum, race) => sum + (race.customer_bonus || 0), 0)).toFixed(2)),
          admin_bonus: Number((races.reduce((sum, race) => sum + (race.admin_bonus || 0), 0)).toFixed(2)),
          total: Number((races.reduce((sum, race) => sum + (race.zem_bonus || 0) + (race.customer_bonus || 0) + (race.admin_bonus || 0), 0)).toFixed(2))
        };
      }),
      catchError(error => {
        console.error('Error fetching races:', error);
        return of({
          zem_bonus: 0,
          customer_bonus: 0,
          admin_bonus: 0,
          total: 0
        });
      })
    ); 
  }
}