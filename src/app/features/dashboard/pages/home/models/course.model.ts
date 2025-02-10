export interface Course {
    id: string;
    created_at: string;
    status: string;  // 'completed', 'cancelled', etc.
    // Ajoutez d'autres propriétés selon vos besoins
  }
  
  export interface CourseStats {
    total: number;
    completed: number;
    cancelled: number;
    lastUpdate: Date;
  }