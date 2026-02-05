export interface search {
  code: number;
  data: Data;
  list: string;
  message: string;
  [property: string]: any;
}

export interface Data {
  list: List[];
  query_time_ms: number;
  total: number;
  [property: string]: any;
}

export interface List {
  activity_start_time?: string;
  category_name?: string;
  cover_type?: number;
  cover_url?: string;
  current_participants?: number;
  id?: number;
  location?: string;
  max_participants?: number;
  organizer_avatar?: string;
  organizer_name?: string;
  status?: number;
  status_text?: string;
  tags?: string[];
  title?: string;
  [property: string]: any;
}

export interface SearchRequest {
  category_id?: number;
  page?: number;
  page_size?: number;
  q?: string;
  sort?: string;
  [property: string]: any;
}