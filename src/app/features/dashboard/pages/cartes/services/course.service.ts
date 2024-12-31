import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../../../environments/environment';
import {Course, CourseFilter} from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/races`;

  constructor(private http: HttpClient) {}

  getCompletedCourses(filters?: CourseFilter): Observable<Course[]> {
    let params = new HttpParams()
      .set('status', 'completed');

    if (filters) {
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate.toISOString());
      }
      if (filters.region) {
        params = params.set('region', filters.region);
      }
      if (filters.transporteurId) {
        params = params.set('transporteurId', filters.transporteurId);
      }
      if (filters.clientId) {
        params = params.set('clientId', filters.clientId);
      }
    }

    return this.http.get<Course[]>(this.apiUrl, { params });
  }
}
