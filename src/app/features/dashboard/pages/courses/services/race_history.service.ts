import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RaceHistory } from '../models/race.model';
@Injectable({
    providedIn: 'root'
})
export class RaceHistoryService {
    constructor(private httpService: HttpClient) {
     }

     private apiUrl = environment.apiUrl + "/race-history";

     getRaceHistory(){
       
            const headers = new HttpHeaders({
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            });
        
         return this.httpService.get<RaceHistory[]>(this.apiUrl, {headers});
     }
}
