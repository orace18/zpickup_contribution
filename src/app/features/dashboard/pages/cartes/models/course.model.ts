export interface Course {
  id: string;
  dateDebut: Date;
  dateFin: Date;
  status: 'active' | 'completed' | 'canceled';
  departLat: number;
  departLng: number;
  destinationLat: number;
  destinationLng: number;
  clientId: string;
  transporteurId: string;
  prix: number;
}

export interface CourseFilter {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  region?: string;
  transporteurId?: string;
  clientId?: string;
}
