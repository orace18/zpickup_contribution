export interface User {
  _id: string;
  phone_number: string;
  user_type: 'customer' | 'zem' | 'admin';
  firstname?: string;
  lastname?: string;
  created_at: string;
  validated_at: string;
  zem?: string;
}
