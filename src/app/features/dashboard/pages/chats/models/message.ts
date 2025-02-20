import { MessageSender } from "./conversation";

export interface Message {
  id: string;
  content: string;
  discussion: string;
  sender: MessageSender;
  created_at: string;
  updated_at: string;
  timestamp?: Date;
}