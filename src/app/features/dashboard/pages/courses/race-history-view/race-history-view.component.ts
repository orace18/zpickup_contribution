import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RaceHistory } from '../models/race.model';
import { RaceHistoryService } from '../services/race_history.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { TableModule } from 'primeng/table';
import { UserService } from '../../home/services/home.service';
declare var google: any;

@Component({
  selector: 'app-race-history-view',
  imports: [CommonModule, LoadingComponent, TableModule],
  standalone: true,
  templateUrl: './race-history-view.component.html',
  styleUrl: './race-history-view.component.css'
})
export class RaceHistoryViewComponent implements OnInit, AfterViewInit, OnDestroy {
  raceId: string | null = null;
  raceHistories: RaceHistory[] = [];
  latestAcceptedHistory: RaceHistory | null = null;
  latestStartHistoriesByUser: RaceHistory[] = []; 
  loading: boolean = true;
  error: string | null = null;
  map: any = null;
  markers: any[] = [];
  startPoint: any = null;
  directionsService: any = null;
  directionsRenderers: any[] = [];
  mapUpdateInterval: any = null;
  

  constructor(
    private route: ActivatedRoute,
    private raceHistoryService: RaceHistoryService,
    private userService: UserService
  ) {}


  ngOnInit(): void {
    this.raceId = this.route.snapshot.paramMap.get('id');
    console.log("L'identifiant de la course est", this.raceId);
    
    if (this.raceId) {
      this.loadRaceHistory();

      this.startRealtimeUpdates();
    } else {
      this.error = "Identifiant de course non trouvé";
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
   
  }

  closeWindow(): void {
    window.close();
  }

  isObject(value: any): boolean {
    return value !== null && !Array.isArray(value) && Object(value) === value;
  }

  loadRaceHistory(): void {
    this.loading = true;
    
    this.raceHistoryService.getRaceHistory().subscribe({
      next: (data: RaceHistory[]) => {
        this.raceHistories = data;
        
        const courseHistories = this.raceHistories.filter(
          history => history.race && this.isObject(history.race) && history.race._id === this.raceId
        );
        
        this.getLatestStartHistoriesForDifferentUsers(courseHistories);
  
        const hasStartEntries = this.latestStartHistoriesByUser.length > 0;
        
        if (!hasStartEntries) {
          const acceptedHistories = courseHistories.filter(
            history => history.status === 'accepted'
          );
          
          if (acceptedHistories.length > 0) {
            acceptedHistories.sort((a, b) => {
              const dateA = new Date(a.updated_at).getTime();
              const dateB = new Date(b.updated_at).getTime();
              return dateB - dateA; 
            });
            
            this.latestAcceptedHistory = acceptedHistories[0];
            console.log('Dernière entrée acceptée trouvée', this.latestAcceptedHistory);
          } else {
            console.log('Aucune entrée avec statut "accepté" trouvée');
          }
        } else {
          this.latestAcceptedHistory = null;
          console.log('Course démarrée, masquage des données acceptées');
        }
  
        this.loading = false;
        
        setTimeout(() => {
          this.initGoogleMap();
        }, 100);
      },
      error: (err) => {
        this.error = "Impossible de charger l'historique de la course";
        this.loading = false;
        console.error('Erreur de chargement de l\'historique', err);
      }
    });
  }

  getLatestStartHistoriesForDifferentUsers(courseHistories: RaceHistory[]): void {
    const startHistories = courseHistories.filter(history => history.status === 'start');
    
    if (startHistories.length > 0) {
      const userMap = new Map<string, RaceHistory>();
      
      startHistories.sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA; 
      });
      
      startHistories.forEach(history => {
        let userId = '';
        if (history.user) {
          if (this.isObject(history.user)) {
            userId = history.user || '';
          } else {
            userId = String(history.user);
          }
        }
        
        if (userId && !userMap.has(userId)) {
          userMap.set(userId, history);
        }
      });
      
      this.latestStartHistoriesByUser = Array.from(userMap.values());
      
      console.log('Dernières entrées "start" par utilisateur:', this.latestStartHistoriesByUser);
    } else {
      console.log('Aucune entrée avec statut "start" trouvée');
    }
  }
  

userDisplayNames: Map<string, string> = new Map();

getUserDisplayName(userId: any): string {
  
  
  if (this.userDisplayNames.has(userId)) {
    return this.userDisplayNames.get(userId) || 'Utilisateur';
  }
  
  this.loadUserDisplayName(userId);
  return 'Chargement...';
}

loadUserDisplayName(userId: string): void {
  this.userService.getUserById(userId).subscribe({
    next: (data: any) => {
      console.log("Le user nom et prenom: ", data);
      const displayName = `${data.lastname} ${data.firstname}`.trim() || 'Utilisateur';
      this.userDisplayNames.set(userId, displayName);
      
      this.raceHistories = [...this.raceHistories];
    },
    error: (err) => {
      console.error("Erreur lors du chargement de l'utilisateur", err);
      this.userDisplayNames.set(userId, 'Utilisateur');
    }
  });
}



updateMapData(): void {
  console.log("Mise à jour de la carte en temps réel...");
  
  this.raceHistoryService.getRaceHistory().subscribe({
    next: (data: RaceHistory[]) => {
      this.raceHistories = data;
      
      const courseHistories = this.raceHistories.filter(
        history => history.race && this.isObject(history.race) && history.race._id === this.raceId
      );
      
      this.getLatestStartHistoriesForDifferentUsers(courseHistories);

      const hasStartEntries = this.latestStartHistoriesByUser.length > 0;
      
      if (!hasStartEntries) {
        const acceptedHistories = courseHistories.filter(
          history => history.status === 'accepted'
        );
        
        if (acceptedHistories.length > 0) {
          acceptedHistories.sort((a, b) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return dateB - dateA; 
          });
          
          this.latestAcceptedHistory = acceptedHistories[0];
          console.log('Dernière entrée acceptée trouvée', this.latestAcceptedHistory);
        }
      }
      
      this.initGoogleMap();
    },
    error: (err) => {
      console.error('Erreur de mise à jour de la carte', err);
    }
  });
}

startRealtimeUpdates(): void {
  if (this.mapUpdateInterval) {
    clearInterval(this.mapUpdateInterval);
  }
  
  this.mapUpdateInterval = setInterval(() => {
    this.updateMapData();
  }, 15000); 
}
  
  ngOnDestroy(): void {
    if (this.mapUpdateInterval) {
      clearInterval(this.mapUpdateInterval);
    }
    
    this.clearDirections();
  }
  
  clearDirections(): void {
    if (this.directionsRenderers && this.directionsRenderers.length > 0) {
      this.directionsRenderers.forEach(renderer => {
        renderer.setMap(null);
      });
      this.directionsRenderers = [];
    }
  }
  
  initGoogleMap(): void {
    const mapElement = document.getElementById('google-map');
    
    if (!mapElement) return;
    
    this.startPoint = null;
    if (this.latestAcceptedHistory && this.latestAcceptedHistory.race) {
      if (this.latestAcceptedHistory.race.latitude_start && this.latestAcceptedHistory.race.longitude_start) {
        this.startPoint = {
          lat: this.latestAcceptedHistory.race.latitude_start,
          lng: this.latestAcceptedHistory.race.longitude_start
        };
      }
    } else if (this.latestStartHistoriesByUser.length > 0 && this.latestStartHistoriesByUser[0].race) {
      if (this.latestStartHistoriesByUser[0].race.latitude_start && this.latestStartHistoriesByUser[0].race.longitude_start) {
        this.startPoint = {
          lat: this.latestStartHistoriesByUser[0].race.latitude_start,
          lng: this.latestStartHistoriesByUser[0].race.longitude_start
        };
      }
    }
    
    const hasStartPositions = this.latestStartHistoriesByUser.length > 0 && 
                             this.latestStartHistoriesByUser.some(h => h.latitude && h.longitude);
    
    const hasAcceptedPosition = !hasStartPositions && this.latestAcceptedHistory && 
                               this.latestAcceptedHistory.latitude && 
                               this.latestAcceptedHistory.longitude;
    
    if (!hasAcceptedPosition && !hasStartPositions && !this.startPoint) {
      mapElement.innerHTML = '<div class="alert alert-info m-3">Aucune position géographique disponible</div>';
      return;
    }
    
    let centerPosition;
    if (hasStartPositions) {
      const firstValidStart = this.latestStartHistoriesByUser.find(h => h.latitude && h.longitude);
      centerPosition = {
        lat: firstValidStart!.latitude,
        lng: firstValidStart!.longitude
      };
    } else if (hasAcceptedPosition) {
      centerPosition = {
        lat: this.latestAcceptedHistory!.latitude,
        lng: this.latestAcceptedHistory!.longitude
      };
    } else if (this.startPoint) {
      centerPosition = this.startPoint;
    }
    
    const mapOptions = {
      center: centerPosition,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    };
    
    if (!this.map) {
      this.map = new google.maps.Map(mapElement, mapOptions);
      this.directionsService = new google.maps.DirectionsService();
    } else {
      this.map.setCenter(centerPosition);
    }
    
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    this.clearDirections();
    
    const bounds = new google.maps.LatLngBounds();
    
    if (this.startPoint) {
      const marker = new google.maps.Marker({
        position: this.startPoint,
        map: this.map,
        title: "Point de départ",
        animation: google.maps.Animation.DROP,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <strong>Point de départ de la course</strong><br>
            Coordonnées: ${this.startPoint.lat}, ${this.startPoint.lng}
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
      
      this.markers.push(marker);
      bounds.extend(this.startPoint);
    }
    
    if (hasAcceptedPosition) {
      const position = {
        lat: this.latestAcceptedHistory!.latitude,
        lng: this.latestAcceptedHistory!.longitude
      };
      
      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: this.latestAcceptedHistory!.street,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'assets/images/image_zem.png', 
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 20)
        }
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <strong>Position acceptée</strong><br>
            ${this.latestAcceptedHistory!.street}<br>
            ${this.latestAcceptedHistory!.locality}, ${this.latestAcceptedHistory!.country}
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
      
      this.markers.push(marker);
      bounds.extend(position);
      
      if (this.startPoint) {
        this.calculateAndDisplayRoute(this.startPoint, position);
      }
    }
    
    this.latestStartHistoriesByUser.forEach((history, index) => {
      if (history.latitude && history.longitude) {
        const position = {
          lat: history.latitude,
          lng: history.longitude
        };
        
        const userInfo = this.getUserDisplayName(history.user);

        
        const marker = new google.maps.Marker({
          position: position,
          map: this.map,
          title: userInfo,
          animation: google.maps.Animation.DROP,
          
          icon: {
            url: 'assets/images/image_client.png',
            scaledSize: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20)
          }
        });
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <strong>${userInfo}</strong><br>
              ${history.street}<br>
              ${history.locality}, ${history.country}<br>
              <small>Dernière mise à jour: ${new Date(history.updated_at).toLocaleString()}</small>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });
        
        this.markers.push(marker);
        bounds.extend(position);
        
        if (this.startPoint) {
          this.calculateAndDisplayRoute(this.startPoint, position);
        }
      }
    });
    
    if (this.markers.length > 1) {
      this.map.fitBounds(bounds);
    }
  }
  
  calculateAndDisplayRoute(origin: any, destination: any): void {
    if (!this.directionsService) {
      this.directionsService = new google.maps.DirectionsService();
    }
    
    const request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };
    
    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: this.map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#FF5722',
            strokeWeight: 4,
            strokeOpacity: 0.7
          }
        });
        
        directionsRenderer.setDirections(result);
        this.directionsRenderers.push(directionsRenderer);
      } else {
        console.error("Impossible de calculer l'itinéraire : ", status);
      }
    });
  }

  getLabel(status: string): string {
    switch(status) {
      case 'accepted': return 'Acceptée';
      case 'pending': return 'En attente';
      case 'start': return 'Démarrée';
      case 'stopped': return 'Arretée';
      case 'end': return 'Terminée';
      default: return status;
    }
  }
}