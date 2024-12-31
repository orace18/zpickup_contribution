/* import { Component, OnInit } from '@angular/core';
import { Ticket } from './models/tickets.model';
import { TicketService } from './services/tickets.service';


@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  nouveauTicket: Ticket = {
    id: 0,
    titre: '',
    description: '',
    date: new Date().toISOString(),
    status: 'Ouvert',
    utilisateurId: 1 // L'ID de l'utilisateur
  };

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  // Charger les tickets
  loadTickets(): void {
    this.ticketService.getTickets().subscribe(tickets => {
      this.tickets = tickets;
    });
  }

  // Ajouter un ticket
  ajouterTicket(): void {
    this.ticketService.addTicket(this.nouveauTicket).subscribe(ticket => {
      this.tickets.push(ticket);
      this.nouveauTicket = {
        id: 0,
        titre: '',
        description: '',
        date: new Date().toISOString(),
        status: 'Ouvert',
        utilisateurId: 1
      };
    });
  }

  // Modifier un ticket
  modifierTicket(ticket: Ticket): void {
    this.ticketService.updateTicket(ticket).subscribe(updatedTicket => {
      const index = this.tickets.findIndex(t => t.id === updatedTicket.id);
      if (index !== -1) {
        this.tickets[index] = updatedTicket;
      }
    });
  }

  // Supprimer un ticket
  supprimerTicket(id: number): void {
    this.ticketService.deleteTicket(id).subscribe(() => {
      this.tickets = this.tickets.filter(t => t.id !== id);
    });
  }
}
 */

import { Component, OnInit } from '@angular/core';
import { Ticket } from './models/tickets.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Commenter l'importation du service si tu veux gérer les données manuellement
// import { TicketService } from './services/tickets.service';

@Component({
  selector: 'app-tickets',
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  nouveauTicket: Ticket = {
    id: 0,
    titre: '',
    description: '',
    date: new Date().toISOString(),
    status: 'Ouvert',
    utilisateurId: 1 // L'ID de l'utilisateur
  };

  // Supprimer l'instance du service pour ne plus utiliser l'API
  // constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets(); // Charger les tickets manuellement
  }

  // Charger les tickets manuellement (simulation des données)
  loadTickets(): void {
    // Simuler les données de tickets
    this.tickets = [
      {
        id: 1,
        titre: 'Problème de connexion',
        description: 'L\'utilisateur ne peut pas se connecter.',
        date: '2024-12-18T10:00:00Z',
        status: 'Ouvert',
        utilisateurId: 1
      },
      {
        id: 2,
        titre: 'Erreur de paiement',
        description: 'L\'utilisateur rencontre une erreur lors du paiement.',
        date: '2024-12-18T11:00:00Z',
        status: 'En cours',
        utilisateurId: 2
      },
      {
        id: 3,
        titre: 'Problème de livraison',
        description: 'Le colis n\'a pas été livré.',
        date: '2024-12-18T12:00:00Z',
        status: 'Fermé',
        utilisateurId: 3
      }
    ];
  }

  // Ajouter un ticket manuellement
  ajouterTicket(): void {
    // Simuler l'ajout d'un ticket
    const newTicket: Ticket = {
      ...this.nouveauTicket,
      id: this.tickets.length + 1 // Générer un ID unique
    };
    this.tickets.push(newTicket);
    
    // Réinitialiser le formulaire
    this.nouveauTicket = {
      id: 0,
      titre: '',
      description: '',
      date: new Date().toISOString(),
      status: 'Ouvert',
      utilisateurId: 1
    };
  }

  // Modifier un ticket manuellement
  modifierTicket(ticket: Ticket): void {
    const index = this.tickets.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      this.tickets[index] = { ...this.tickets[index], ...ticket };
    }
  }

  // Supprimer un ticket manuellement
  supprimerTicket(id: number): void {
    this.tickets = this.tickets.filter(t => t.id !== id);
  }
}
