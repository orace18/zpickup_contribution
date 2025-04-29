import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../../../environments/environment';

export interface Role {
  _id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
  __v: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl+'/role';

  constructor(private http: HttpClient) { }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }
}
