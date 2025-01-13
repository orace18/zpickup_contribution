import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {Race} from '../models/race.model';
import {environment} from '../../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private apiUrl = environment.apiUrl + '/races';

  constructor(private http: HttpClient) {}

  getRaces(): Observable<Race[]> {
    return this.http.get<Race[]>(this.apiUrl);
  }

  getUserRaces(userId: string | undefined): Observable<Race[]> {
    return this.getRaces().pipe(
      map(races => races.filter(race => race.user._id === userId))
    );
  }

  getRacesList(id:string): Observable<Race[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);

    return this.http.get<Race[]>(`${this.apiUrl}/user/races/list/${id}`,{ headers});
  }
}
