import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Race } from '../../../app/features/dashboard/pages/users/models/race.model';
import { map, Observable } from 'rxjs';
import { UserService } from '../../../app/features/dashboard/pages/home/services/home.service';
import { LoadingComponent } from "../../../core/components/loading/loading.component";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../../app/features/dashboard/pages/users/models/users.model';

@Component({
  selector: 'app-details-component',
  imports: [CommonModule, LoadingComponent],
  standalone: true,
  templateUrl: './details-component.component.html',
  styleUrl: './details-component.component.css'
})
export class DetailsComponentComponent implements OnInit, OnChanges{
  @Input() race?: Race;
  @Input() selectedUser: 'customer' | 'zem' = 'customer';
  zemFullName: string = '';
  isLoading: boolean = true;
  loadingMessage: string = 'Chargement des informations...';
  private apiUserUrl = environment.apiUrl + "/users";
  


  constructor(private homeService: UserService,
    private httpService: HttpClient,

  ) {}

  getZemFullName(): string {
    return this.race?.zem 
      ? `${this.race.zem.firstname} ${this.race.zem.lastname}` 
      : 'Non assigné';
  }

  getUsers(): Observable<any[]> {
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
    });

    return this.httpService.get<User[]>(`${this.apiUserUrl}`, {headers});

}

  getTransporteurFullName(zemId: string): string {

    this.getUsers().pipe(
      map(users => {
        const zem = users.find(user => user?.zem === zemId || user?.zem === zemId);
        return zem ? `${zem.firstname} ${zem.lastname}` : 'Non disponible';
      })
    ).subscribe(fullName => {
      this.zemFullName = fullName;
    });
    
 
    return this.zemFullName || '';
  }
  
  getUserByZem(): Observable<User | undefined> {
    return this.getUsers().pipe(
      map(users => 
        users.find(user => 
          user.firstname === this.race?.zem?.firstname && 
          user.lastname === this.race?.zem?.lastname
        )
      )
    );
  }

  ngOnInit(): void {

    if(this.race){
      if(this.race.zem){
        this.getTransporteurFullName(this.race?.zem?._id || '');
      }
    }
    

    this.getUserByZem().subscribe(user => {
      if (user) {
        console.log('Utilisateur trouvé:', user);
      } else {
        console.log('Aucun utilisateur correspondant trouvé');
      }
    });

    setTimeout(() => {
      if(this.race){
      this.initMap(this.race);
    }
    this.isLoading = false; 
    }, 500);
    
  }

  ngOnChanges() {
    console.log('Race reçue dans le composant de détails :', this.race);
    if (this.race) {
      this.initMap(this.race);
    }
  }

  initMap(race: Race) {
    const mapElement = document.getElementById(`map_${race.reference}`);
    if (!mapElement) return;

    // Vérification des coordonnées requises
    if (!race.latitude_start || !race.longitude_start || !race.latitude_end || !race.longitude_end) {
      console.error('Coordonnées manquantes', race);
      return;
    }

    const startLocation = {
      lat: parseFloat(String(race.latitude_start)),
      lng: parseFloat(String(race.longitude_start))
    };

    const endLocation = {
      lat: race.latitude_end,
      lng: race.longitude_end
    };

    console.log('Coordonnées de départ:', startLocation);
    console.log('Coordonnées d\'arrivée:', endLocation);

    // Ajustons le zoom et le centre pour voir les deux points
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startLocation);
    bounds.extend(endLocation);

    const map = new google.maps.Map(mapElement, {
      zoom: 12, // Zoom plus large
      center: startLocation
    });

    map.fitBounds(bounds); // Ajuste la vue pour montrer les deux points

    // Marqueur de départ
    const startMarker = new google.maps.Marker({
      position: startLocation,
      map: map,
      title: 'Point de départ',
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    console.log('Marqueur de départ créé:', startMarker);

    // Marqueur d'arrivée
    const endMarker = new google.maps.Marker({
      position: endLocation,
      map: map,
      title: 'Point d\'arrivée',
      icon: {
        url: 'assets/images/image_client.png', 
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20)
      }
    });
    console.log('Marqueur d\'arrivée créé:', endMarker);

    // Tracer l'itinéraire
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true // Pour garder nos marqueurs personnalisés
    });

    directionsService.route({
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      console.log('Statut de la direction:', status);
      console.log('Réponse de la direction:', response);

      if (status === google.maps.DirectionsStatus.OK && response) {
        directionsRenderer.setDirections(response);
      } else {
        console.error('Erreur de direction:', status);
      }
    });


  }
}
