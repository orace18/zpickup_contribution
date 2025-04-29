import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../../../../environments/environment";
import { Observable, catchError, forkJoin, map, of, tap } from "rxjs";
import { Race } from "../../users/models/race.model";
import { Injectable } from "@angular/core";
import { GainHistory } from "../models/gains.model";



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

  getGains(): Observable<GainHistory[]> {
    return this.getRaces().pipe(
      map(races => 
        races
          // Filtrer uniquement les courses avec au moins un bonus
          .filter(race => 
            (race.zem_bonus && race.zem_bonus > 0) || 
            (race.customer_bonus && race.customer_bonus > 0) || 
            (race.admin_bonus && race.admin_bonus > 0)
          )
          // Transformer les données
          .map(race => ({
            date: race?.ended_at ? new Date(race.ended_at).toLocaleDateString('fr-FR') : '',
            reference: race.reference || '',
            zem_bonus: Number((race.zem_bonus || 0).toFixed(2)),
            customer_bonus: Number((race.customer_bonus || 0).toFixed(2)),
            admin_bonus: Number((race.admin_bonus || 0).toFixed(2)),
            total: Number(((race.zem_bonus || 0) + 
                        (race.customer_bonus || 0) + 
                        (race.admin_bonus || 0)).toFixed(2))
          }))
      ),
      map(races => races.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )),
      catchError(error => {
        console.error('Error calculating race gains:', error);
        return of([]);
      })
    );
  }
}