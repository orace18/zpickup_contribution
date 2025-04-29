export interface Conversation {
  id: string;
  title: string;
  creator: string;
  email?: string;
  avatar?: string;
  messages: string[];
  created_at: string;
  updated_at: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount?: number;
}



