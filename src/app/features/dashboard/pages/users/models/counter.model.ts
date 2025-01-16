export interface CounterData {
  currentBalance: number;
  totalKmTraveled: number;
  rechargeHistory: {
    _id: string;
    km_amount: number;
    price_per_km: number;
    payment_method: string;
    transaction_id: string;
    status: string;
    created_at: string;
  }[];
  statistics: {
    total_recharges: number;
    total_races: number;
  };
}
