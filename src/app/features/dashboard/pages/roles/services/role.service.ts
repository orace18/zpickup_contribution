import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Role } from '../models/role.model';
import {environment} from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRole(roleData: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/role`, roleData);
  }

  // Méthodes additionnelles utiles
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/role`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/role/${id}`);
  }

  updateRole(id: string, roleData: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, roleData);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }
}
