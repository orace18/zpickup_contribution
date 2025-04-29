export interface FinancialCard {
  title: string;
  amount: number;
  icon: string;
  color: string;
}

export interface GainsResult {
  zem_bonus: number;
  customer_bonus: number;
  admin_bonus: number;
  total: number;
}

export interface GainHistory {
  date: string;
  reference: string;
  zem_bonus: number;
  customer_bonus: number;
  admin_bonus: number;
  total: number;
}