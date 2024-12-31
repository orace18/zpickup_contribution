export interface Ticket {
    id: number;
    titre: string;
    description: string;
    date: string;
    status: 'Ouvert' | 'Fermé' | 'En cours';
    utilisateurId: number;
  }
  