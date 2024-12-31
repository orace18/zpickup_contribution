import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-assureurs',
  imports:[CommonModule,FormsModule,],
  templateUrl: './assureurs.component.html',
  styleUrls: ['./assureurs.component.css']
})
export class AssureursComponent implements OnInit {
  assureurs: any[] = [];  // Tableau des assureurs
  selectedAssureur: any = null;  // Assureur sélectionné pour modification
  isEditing: boolean = false;  // Détermine si nous sommes en mode édition ou non

  constructor(/* private assureurService: AssureurService */) { }

  ngOnInit(): void {
    // Charger les assureurs (données fictives ici)
    this.assureurs = [
      { id: 1, nom: 'Assureur 1', email: 'assureur1@example.com', telephone: '123456789', utilisateursAssocies: 10 },
      { id: 2, nom: 'Assureur 2', email: 'assureur2@example.com', telephone: '987654321', utilisateursAssocies: 20 },
    ];
  }

  onEditAssureur(assureur: any): void {
    this.selectedAssureur = { ...assureur };  // Dupliquer l'assureur sélectionné pour l'éditer
    this.isEditing = true;  // Passer en mode édition
  }

  onCancelEdit(): void {
    this.isEditing = false;  // Annuler la modification
    this.selectedAssureur = null;
  }

  onSaveAssureur(): void {
    // Si vous avez un service, voici où vous feriez un appel à l'API pour sauvegarder les modifications
    // this.assureurService.updateAssureur(this.selectedAssureur).subscribe(response => {
    //   console.log('Assureur mis à jour', response);
    //   this.isEditing = false;  // Sortir du mode édition après enregistrement
    // });

    // Pour l'instant, nous allons juste afficher dans la console
    console.log('Assureur mis à jour', this.selectedAssureur);
    this.isEditing = false;  // Sortir du mode édition
  }

  onAddAssureur(): void {
    console.log('Ajout d\'un assureur');
    // Logique pour ajouter un assureur, par exemple :
    this.assureurs.push({ name: 'Nouveau Assureur', id: this.assureurs.length + 1 });
  }
}
