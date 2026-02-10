export interface offline {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  messages: Message[];
  [property: string]: any;
}

export interface Message {
  content?: string;
  created_at?: string;
  group_id?: string;
  message_id?: string;
  msg_type?: number;
  sender_id?: number;
  sender_name?: string;
  [property: string]: any;
}