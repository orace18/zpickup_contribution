export interface Course {
    id: string;
    created_at: string;
    status: string;  // 'completed', 'cancelled', etc.
  }
  
  export interface CourseStats {
    total: number;
    completed: number;
    cancelled: number;
    lastUpdate: Date;
  }