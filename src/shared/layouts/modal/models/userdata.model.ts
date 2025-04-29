export interface UserData {
    access_token: string;
    user: {
      _id: string;
      email_address: string;
      phone_number: string;
      firstname: string;
      lastname: string;
      user_type: string;
      role: {
        name: string;
        key: string;
        description: string;
      }
    }
  }
  