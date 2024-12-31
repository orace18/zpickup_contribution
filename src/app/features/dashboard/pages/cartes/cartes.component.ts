import { Component, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatDivider} from '@angular/material/divider';
import {Course, CourseFilter} from './models/course.model';
import {CourseService} from './services/course.service';

interface FilterState {
  transporteurStatus: 'all' | 'active' | 'inactive';
  clientStatus: 'all' | 'active' | 'inactive';
  courseStatus: 'all' | 'active' | 'completed' | 'canceled';
  region: string;
  dateRange: { start: Date | null; end: Date | null };
}


@Component({
  selector: 'app-cartes',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDivider
  ],
  templateUrl: './cartes.component.html',
  styleUrls: ['./cartes.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ],
})


export class CartesComponent implements OnInit {
  center = { lat: 40.748817, lng: -73.985428 };
  zoom = 13;
  currentPosition: google.maps.LatLngLiteral | null = null;
  filterForm: FormGroup;
  isPanelVisible = false;
  completedCourses: Course[] = [];
  isLoading = false

  constructor(private fb: FormBuilder,
              private courseService: CourseService) {
    this.filterForm = this.fb.group({
      transporteurStatus: ['all'],
      clientStatus: ['all'],
      courseStatus: ['all'],
      region: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit() {
    this.getCurrentLocation();
  }

  private getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.center = this.currentPosition;
        },
        (error: GeolocationPositionError) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  }

  toggleControlPanel() {
    this.isPanelVisible = !this.isPanelVisible;
  }


  resetFilters() {
    this.filterForm.reset({
      transporteurStatus: 'all',
      clientStatus: 'all',
      courseStatus: 'all',
      region: '',
      startDate: null,
      endDate: null
    });
  }

  applyFilters() {
    this.isLoading = true;
    const formValues = this.filterForm.value;

    const filters: CourseFilter = {
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      region: formValues.region
    };

    if (formValues.courseStatus === 'completed') {
      this.courseService.getCompletedCourses(filters).subscribe({
        next: (courses) => {
          this.completedCourses = courses;
          this.updateMapMarkers(courses);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des courses:', error);
          // Gérer l'erreur (afficher un message à l'utilisateur)
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  private updateMapMarkers(courses: Course[]) {
    courses.forEach(course => {
      // Ajouter des marqueurs sur la carte pour chaque point de départ et d'arrivée
      // Ajouter des polylines pour tracer les trajets
    });
  }


}
