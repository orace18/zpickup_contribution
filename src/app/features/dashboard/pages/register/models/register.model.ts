export interface SignupPayload {
  phone_number: string;
  password: string;
  address: string;
  email_address?: string;
  firstname?: string;
  lastname?: string;
  birthday: string;
  user_type: string;
  role: string;
  created_at: string;
  updated_at: string;
}
