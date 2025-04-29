export interface UserMetrics {
    totalUsers: number;
    totalZem: number;
    totalClients: number;
    weeklyRegistrations: number;
    monthlyRegistrations: number;
  }
  
  export interface AppMetrics {
    totalDownloads: number;
    androidDownloads: number;
    iosDownloads: number;
  }
  
  export  interface InsuranceMetrics {
    valid: number;
    expired: number;
    expiringSoon: number;
  }
  
  export interface PendingValidations {
    zem: number;
    documents: number;
    total: number;
  }
  
  export interface UserActivity {
    active: number;
    inactive: number;
    engagementRate: number;
  }

  export interface Zem {
    profile_validation_status: string;
    validated_at: string | null;
  }