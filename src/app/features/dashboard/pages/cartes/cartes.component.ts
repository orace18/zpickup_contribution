import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { Race } from '../users/models/race.model';
import { RaceService } from '../users/services/race.service';

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
    MatTabsModule,
    MatChipsModule
  ],
  templateUrl: './cartes.component.html',
  styleUrl: './cartes.component.css',
})
export class CartesComponent implements OnInit {
  @ViewChildren(GoogleMap) maps!: QueryList<GoogleMap>;
  
  center = { lat: 6.3702928, lng: 2.3912362 };
  zoom = 19;
  races: Race[] = [];
  directionsRenderers: Record<string, google.maps.DirectionsRenderer[]> = {
    all: [],
    pending: [],
    started: [],
    completed: [],
    canceled: []
  };

  markerColors = {
    pending: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    start: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    accepted: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    end: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    stopped: 'http://maps.google.com/mapfiles/ms/icons/grey-dot.png'
  };

  constructor(private raceService: RaceService) {}

  ngOnInit() {
    this.loadRaces();
  }

  loadRaces() {
    this.raceService.getRaces().subscribe(races => {
      this.races = races;
      setTimeout(() => {
        this.displayRoutesForAllTabs();
      }, 500);
    });
  }

  displayRoutesForAllTabs() {
    const mapsArray = this.maps.toArray();
    if (mapsArray.length === 0) return;

    // Afficher toutes les courses
    this.displayRoutesForMap(mapsArray[0], this.races, 'all');

    // Afficher les courses en attente
    const pendingRaces = this.races.filter(race => race.status === 'pending');
    this.displayRoutesForMap(mapsArray[1], pendingRaces, 'pending');

    // Afficher les courses en cours
    const startedRaces = this.races.filter(race => ['start', 'accepted'].includes(race.status));
    this.displayRoutesForMap(mapsArray[2], startedRaces, 'started');

    // Afficher les courses terminées
    const completedRaces = this.races.filter(race => race.status === 'end');
    this.displayRoutesForMap(mapsArray[3], completedRaces, 'completed');

    // Afficher les courses annulées
    const canceledRaces = this.races.filter(race => race.status === 'stopped');
    this.displayRoutesForMap(mapsArray[4], canceledRaces, 'canceled');
  }

  displayRoutesForMap(map: GoogleMap, races: Race[], mapType: string) {
    // Nettoyer les routes existantes
    this.directionsRenderers[mapType].forEach(renderer => renderer.setMap(null));
    this.directionsRenderers[mapType] = [];

    races.forEach(race => {
      this.displayRoute(race, map, mapType);
    });

    // Centrer la carte sur les courses affichées
    this.centerMapOnRaces(map, races);
  }

  displayRoute(race: Race, map: GoogleMap, mapType: string) {
    if (!this.hasValidCoordinates(race)) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: this.getRouteColor(race.status),
        strokeOpacity: 1.0,
        strokeWeight: 4
      }
    });

    directionsRenderer.setMap(map.googleMap!);
    this.directionsRenderers[mapType].push(directionsRenderer);

    // Créer les marqueurs personnalisés
    this.createMarkers(race, map);

    // Calculer l'itinéraire
    const startLocation = this.getStartPosition(race);
    const endLocation = this.getEndPosition(race);

    directionsService.route({
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK && response) {
        directionsRenderer.setDirections(response);
      } else {
        console.error('Erreur lors du calcul de l\'itinéraire:', status);
      }
    });
  }

  createMarkers(race: Race, map: GoogleMap) {
    const startMarker = new google.maps.Marker({
      position: this.getStartPosition(race),
      map: map.googleMap!,
      title: 'Départ: ' + this.getRaceTitle(race),
      icon: this.markerColors[race.status as keyof typeof this.markerColors]
    });

    if (this.hasEndPosition(race)) {
      const endMarker = new google.maps.Marker({
        position: this.getEndPosition(race),
        map: map.googleMap!,
        title: 'Arrivée: ' + this.getRaceTitle(race),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#796ce7',
          fillOpacity: 1,
          strokeColor: '#fa8c00',
          strokeWeight: 2
        }
      });
    }
  }

  hasValidCoordinates(race: Race): boolean {
    return !!(
      race.initial_latitude && 
      race.initial_longitude && 
      (race.latitude_end || race.latitude_start) && 
      (race.longitude_end || race.longitude_start)
    );
  }

  getRouteColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: '#FFD700',  
      accepted: '#4CAF50', 
      start: '#2196F3',    
      end: '#F44336',      
      stopped: '#9E9E9E'   
    };
    return colorMap[status] || '#000000';
  }

  centerMapOnRaces(map: GoogleMap, races: Race[]) {
    if (races.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    races.forEach(race => {
      if (this.hasValidCoordinates(race)) {
        bounds.extend(this.getStartPosition(race));
        if (this.hasEndPosition(race)) {
          bounds.extend(this.getEndPosition(race));
        }
      }
    });

    map.googleMap?.fitBounds(bounds);
  }

  getRaceTitle(race: Race): string {
    return `Course ${race.reference} - ${race.user.firstname} ${race.user.lastname}
Status: ${race.status}`;
  }

  getMarkerOptions(race: Race): google.maps.MarkerOptions {
    return {
      icon: this.markerColors[race.status as keyof typeof this.markerColors]
    };
  }

  // Méthodes pour compter les courses par statut
  getPendingCount(): number {
    return this.races.filter(race => race.status === 'pending').length;
  }

  getStartedCount(): number {
    return this.races.filter(race => ['start', 'accepted'].includes(race.status)).length;
  }

  getCompletedCount(): number {
    return this.races.filter(race => race.status === 'end').length;
  }

  getCanceledCount(): number {
    return this.races.filter(race => race.status === 'stopped').length;
  }

  getStartPosition(race: Race): google.maps.LatLngLiteral {
    return {
      lat: race.latitude_start || race.initial_latitude || 0,
      lng: race.longitude_start || race.initial_longitude || 0
    };
  }

  getEndPosition(race: Race): google.maps.LatLngLiteral {
    return {
      lat: race.latitude_end || race.latitude_start || 0,
      lng: race.longitude_end || race.longitude_start || 0
    };
  }

  hasEndPosition(race: Race): boolean {
    return !!(race.latitude_end || race.latitude_start) && 
           !!(race.longitude_end || race.longitude_start);
  }

  onTabChange(event: MatTabChangeEvent) {
    const mapsArray = this.maps.toArray();
    const selectedMap = mapsArray[event.index];
    
    // Réafficher les routes pour l'onglet sélectionné
    setTimeout(() => {
      switch(event.index) {
        case 0:
          this.displayRoutesForMap(selectedMap, this.races, 'all');
          break;
        case 1:
          this.displayRoutesForMap(selectedMap, 
            this.races.filter(race => race.status === 'pending'), 
            'pending');
          break;
        case 2:
          this.displayRoutesForMap(selectedMap, 
            this.races.filter(race => ['start', 'accepted'].includes(race.status)), 
            'started');
          break;
        case 3:
          this.displayRoutesForMap(selectedMap, 
            this.races.filter(race => race.status === 'end'), 
            'completed');
          break;
        case 4:
          this.displayRoutesForMap(selectedMap, 
            this.races.filter(race => race.status === 'stopped'), 
            'canceled');
          break;
      }
    }, 100);
  }
}