import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/role`;

  constructor(private http: HttpClient) {}

  // Pour la création, on a toujours besoin d'un Role complet
  createRole(roleData: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, roleData);
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  // Pour la mise à jour, on accepte un Partial<Role>
  updateRole(id: string, roleData: Partial<Role>): Observable<Role> {
    console.log('Update role request:', {id, roleData});
    return this.http.put<Role>(`${this.apiUrl}/${id}`, roleData);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
