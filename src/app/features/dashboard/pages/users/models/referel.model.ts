
export interface Referred {
    _id: string;
    phone_number: string;
    created_at: string;
    firstname: string;
    lastname: string;
    user_type: string;
  }
  
  
export  interface Referral {
    _id: string;
    referrer: string;  
    referred: Referred; 
    bonus_amount: number;
    is_ambassador_referral: boolean;
    zem_validation_bonus_paid: boolean;
    created_at: string;
    updated_at: string;
  }


  export interface MoneyRefferal {
    totalBonus: number;
    totalReferred: number
}