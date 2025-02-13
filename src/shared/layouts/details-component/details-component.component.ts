import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Race } from '../../../app/features/dashboard/pages/users/models/race.model';

@Component({
  selector: 'app-details-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './details-component.component.html',
  styleUrl: './details-component.component.css'
})
export class DetailsComponentComponent implements OnInit, OnChanges{
  @Input() race?: Race;
  @Input() selectedUser: 'customer' | 'zem' = 'customer';

  getZemFullName(): string {
    return this.race?.zem 
      ? `${this.race.zem.firstname} ${this.race.zem.lastname}` 
      : 'Non assigné';
  }

  ngOnInit(): void {
    setTimeout(() => {
      if(this.race){
      this.initMap(this.race);
    }
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
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
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
