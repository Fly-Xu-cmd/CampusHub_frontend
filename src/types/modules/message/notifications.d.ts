export interface notifications {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  notifications: Notification[];
  total: number;
  unread_count: number;
  [property: string]: any;
}

export interface Notification {
  content?: string;
  created_at?: string;
  /**
   * 0-未读 1-已读
   */
  is_read?: boolean;
  notification_id?: string;
  title?: string;
  type?: string;
  [property: string]: any;
}