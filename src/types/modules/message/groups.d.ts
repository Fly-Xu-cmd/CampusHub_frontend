export interface groups {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  groups: Group[];
  page: number;
  page_size: number;
  total: number;
  [property: string]: any;
}

export interface Group {
  activity_id?: string;
  group_id?: string;
  joined_at?: string;
  /**
   * 最后一条消息
   */
  last_message?: string;
  last_message_at?: string;
  member_count?: number;
  name?: string;
  owner_id?: string;
  role?: string;
  /**
   * 1-正常 2-已解散
   */
  status?: number;
  [property: string]: any;
}