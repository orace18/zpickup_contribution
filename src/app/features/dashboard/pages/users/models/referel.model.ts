
export interface Referred {
    _id: string;
    phone_number: string;
    created_at: string;
    firstname: string;
    lastname: string;
    user_type: string;
  }
  
  
  export interface Referral {
    _id: string;
    referrer: string;
    referred: {
      _id: string;
      phone_number: string;
      user_type: string;
      firstname: string;
      lastname: string;
      user_races_count?: string;
      zem?: {
        _id: string;
        zem_races_count: string
      }
    };
    bonus_amount: number;
    is_ambassador_referral: boolean;
    zem_validation_bonus_paid: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
    completed_races: number;
    progress_percentage: number;
    is_goal_reached: boolean;
  }
  
  export interface AmbassadorReferral {
    _id: string;
    created_at: string;
    type: string;
    updated_at: string;
    user: string;
    wallet_amount: number;
    __v: number;
  }


  export interface MoneyRefferal {
    totalBonus: number;
    totalReferred: number
  }

  export interface AmbassadorTransaction {
    _id: string;
    user: string;
    amount: number;
    type: string;
    wallet_type: string;
    created_at: string;
    updated_at: string;
    __v: number;
    formatted_date: string;
  }
  