export interface Role {
  _id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  _id: string;
  phone_number: string;
  email_address: string;
  user_type: string;
  role: Role;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}


export interface LoginResponse {
  access_token: string;
  user: {
    email_address: string;
    phone_number: string;
    user_type: string;
    role: {
      _id: string;
      key: string;
      description: string;
      permissions: string[];
      name: string;
    };
    _id: string;
  };
}

export interface LoginCredentials {
  email_address: string;
  password: string;
}
