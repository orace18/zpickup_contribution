import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ParametresService {

  constructor(private http: HttpClient) {}

  sauvegarderParametres(parametres: any) {
    return this.http.post('', parametres);
  }
}
