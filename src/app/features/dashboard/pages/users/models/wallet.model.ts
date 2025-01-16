export interface WalletBalance {
  _id: string;
  user: string;
  wallet_amount: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  amount: number;
  transaction_type?: string;
  phone_number?: string;
  created_at: string;
  type: 'credit' | 'withdrawal' | 'bonus';
}

export interface WalletHistory {
  total_transactions: number;
  total_withdrawals: number;
  total_credits: number;
  total_withdrawal_amount: number;
  total_credit_amount: number;
  transactions: WalletTransaction[];
}
