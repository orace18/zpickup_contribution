import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RaceHistory } from '../models/race.model';
import { Race } from '../../users/models/race.model';
import { Observable } from 'rxjs';
import { User } from '../../users/models/users.model';

@Injectable({
    providedIn: 'root'
})
export class RaceHistoryService {
    constructor(private httpService: HttpClient) {
    }

    private apiUrl = environment.apiUrl + "/race-history";
    private apiRaceUrl = environment.apiUrl + "/races";

    getRaceHistory(): Observable<RaceHistory[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        });
    
        return this.httpService.get<RaceHistory[]>(this.apiUrl, {headers});
    }

    getRaces(): Observable<Race[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        });
    
        return this.httpService.get<Race[]>(this.apiRaceUrl, {headers});
    }


    
}