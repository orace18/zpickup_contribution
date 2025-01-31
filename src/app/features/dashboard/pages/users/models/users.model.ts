export interface User {
  _id: string;
  phone_number: string;
  password: string;
  verification_code: string | null;
  birthday?: string;
  user_type: string;
  created_at: string;
  updated_at: string;
  validated_at: string | null;
  token_version: number;
  address?: string;
  email_address: string | null;
  firstname: string;
  lastname: string;
  sponsorship_code: string;
  race: string | null;
  zem?: string;
  role: string;
  profile_picture?: string | null;
  two_step_enabled?: boolean;
  last_login?: string;
  balance?: number;
}

export interface ZemValidationRequest {
  profile_validation_status: 'validated' | 'rejected';
  type_action: string;
}

