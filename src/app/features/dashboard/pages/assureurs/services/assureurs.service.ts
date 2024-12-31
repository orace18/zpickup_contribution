import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assureur } from '../models/assureurs.model';
import { environment } from '../../../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AssureursService {
  private apiUrl = environment.apiUrl + "ausseurs";

  constructor(private http: HttpClient) {}

  getAssureurs(): Observable<Assureur[]> {
    return this.http.get<Assureur[]>(this.apiUrl);
  }

  addAssureur(assureur: Assureur): Observable<Assureur> {
    return this.http.post<Assureur>(this.apiUrl, assureur);
  }

  deleteAssureur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
