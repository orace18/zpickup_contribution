export interface Conversation {
  id: string;
  title: string;
  creator: string;
  messages: string[]; 
  created_at: string;
  updated_at: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount?: number;
}

export interface MessageSender {
  userId: string;
  user_type: string;
}


