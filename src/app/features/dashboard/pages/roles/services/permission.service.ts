import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../../../environments/environment';
import {PermissionsResponse} from '../models/permission.model';


@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllPermissions(): Observable<PermissionsResponse> {
    return this.http.get<PermissionsResponse>(`${this.apiUrl}/permissions/grouped`);
  }


}
