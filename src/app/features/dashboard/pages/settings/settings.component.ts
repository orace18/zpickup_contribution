import { Component, OnInit } from '@angular/core';
import { Parametres } from './models/settings.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  standalone: true,
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{
  parametres: Parametres = new Parametres();
  nouveauRole: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialiser les paramètres ou charger les données via un service si nécessaire
  }

  // Méthode pour modifier un tarif
  modifierTarif(service: string, prix: number): void {
    const tarif = this.parametres.tarifs.find(t => t.service === service);
    if (tarif) {
      tarif.prix = prix;
    }
  }

  // Méthode pour ajouter un rôle
  ajouterRole(role: string): void {
     if (role && !this.parametres.roles.includes(role)) {
      this.parametres.roles.push(role);
    }

      this.router.navigate(['/roles']);


  }

  // Sauvegarder les paramètres (ici juste un log pour l'exemple)
  sauvegarderParametres(): void {
    console.log('Paramètres sauvegardés', this.parametres);
  }


}
