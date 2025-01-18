// src/app/models/wallet.model.ts

// Interface représentant la réponse de l'API pour la balance
export interface WalletBalance {
  _id: string;
  user: string;
  wallet_amount: number;
  created_at: string;
  updated_at: string;
  __v: number;
}

// Interface représentant une transaction individuelle de l'API
export interface WalletTransaction {
  _id: string;
  user: string;
  amount: number;
  type: 'credit' | 'withdrawal' | 'bonus';  // Les types que vous utilisez
  created_at: string;
  updated_at: string;
  __v: number;
  transaction_type?: string;  // Optionnel car pas toujours présent
  phone_number?: string;      // Optionnel car pas toujours présent
}

// Interface pour regrouper les statistiques calculées et la liste des transactions
export interface WalletHistory {
  total_transactions: number;
  total_withdrawals: number;
  total_credits: number;
  total_withdrawal_amount: number;
  total_credit_amount: number;
  transactions: WalletTransaction[];
}
