export interface CounterHistory {
  _id: string;
  counter: string;
  value: number;
  counter_type: 'input' | 'output';
  reference: string;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface CounterData {
  currentBalance: number;
  totalKmTraveled: number;
  histories: CounterHistory[];
  statistics: {
    total_recharges: number;
  };
}
