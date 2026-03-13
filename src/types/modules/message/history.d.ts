export interface history {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  /**
   * 是否还有更多历史消息可以加载
   */
  has_more: boolean;
  messages: Message[];
  [property: string]: any;
}

export interface Message {
  content: string;
  created_at: string;
  group_id: string;
  message_id: string;
  msg_type: number;
  sender_id: number;
  sender_name: string;
  [property: string]: any;
}