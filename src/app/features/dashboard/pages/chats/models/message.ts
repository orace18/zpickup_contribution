export interface Message {
  id?: string;
  content?: string;
  imageUrl?: string | null;
  timestamp: Date;
  sender: {
    userId: string;
    name: string;
    avatar?: string;
    user_type: string;
  };
  created_at: string;
  updated_at: string;
}