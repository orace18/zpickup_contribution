import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { GroupedPermissions } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly API_URL = environment.apiUrl;
  private readonly CURRENT_USER_KEY = 'currentUser';
  private permissionsMap: Map<string, string> = new Map();
  private permissionsCache$: Observable<any[]> | null = null


  constructor(private http: HttpClient) {
    this.loadPermissions();
  }

  private loadPermissions() {
    this.getGroupedPermissions().subscribe({
      next: (groupedPermissions) => {
        // Mise à jour de la map en mémoire
        this.permissionsMap.clear();
        Object.values(groupedPermissions).forEach(group => {
          group.forEach(permission => {
            this.permissionsMap.set(permission._id, permission.key);
          });
        });

        // Mise à jour des permissions dans currentUser
        this.updateCurrentUserPermissions();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des permissions:', error);
      }
    });
  }

  private updateCurrentUserPermissions() {
    const currentUserStr = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!currentUserStr) return;

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser?.user?.role?.permissions) {
        // Conversion des IDs en clés
        const updatedPermissions = this.convertPermissionsToKeys(currentUser.user.role.permissions);
        currentUser.user.role.permissions = updatedPermissions;

        // Sauvegarde de l'utilisateur mis à jour
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions utilisateur:', error);
    }
  }

  getGroupedPermissions(): Observable<GroupedPermissions> {
    return this.http.get<GroupedPermissions>(`${this.API_URL}/permissions/grouped`);
  }

  private isMongoId(str: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  convertToPermissionKey(permission: string): string {
    if (this.isMongoId(permission)) {
      const key = this.permissionsMap.get(permission);
      if (!key) {
       // console.warn(`Permission ID non trouvé: ${permission}`);
        return permission;
      }
      return key;
    }
    return permission;
  }

  convertPermissionsToKeys(permissions: string[]): string[] {
    return permissions.map(permission => this.convertToPermissionKey(permission));
  }

  refreshPermissions() {
    this.loadPermissions();
  }



  private getAllPermissions(): Observable<any[]> {
    if (!this.permissionsCache$) {
      this.permissionsCache$ = this.http.get<any[]>(`${this.API_URL}/permissions`).pipe(
        shareReplay(1),
        catchError(error => {
         // console.error('Error fetching permissions:', error);
          return of([]);
        })
      );
    }
    return this.permissionsCache$;
  }

  // Convertit les IDs de permission en clés
  getPermissionKeys(permissions: string[]): Observable<string[]> {
    return this.getAllPermissions().pipe(
      map(allPermissions => {
        const permissionMap = new Map(allPermissions.map(p => [p._id, p.key]));
        return permissions.map(p => permissionMap.get(p) || p);
      })
    );
  }

  // Méthode pour vider le cache si nécessaire
  clearCache() {
    this.permissionsCache$ = null;
  }

}
