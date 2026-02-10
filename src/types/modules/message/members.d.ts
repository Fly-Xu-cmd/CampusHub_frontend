export interface members {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  members: Member[];
  page: number;
  page_size: number;
  total: number;
  [property: string]: any;
}

export interface Member {
  avatar?: string;
  joined_at?: string;
  role?: string;
  user_id?: number;
  username?: string;
  [property: string]: any;
}