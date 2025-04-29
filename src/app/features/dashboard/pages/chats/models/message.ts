export interface Message {
  id: string;
  content?: string;
  timestamp: Date;
  created_at: string;
  updated_at: string;
  sender: {
    user_type: string;
    userId: string;
    name: string;
  };
  mediaType?: 'image' | 'video' | 'audio';
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  mediaUrl?: string;
  [key: string]: any;
}