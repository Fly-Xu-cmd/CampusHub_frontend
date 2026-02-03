export interface activities {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  list: List[];
  pagination: Pagination;
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
  tags?: Tag[];
  title?: string;
  [property: string]: any;
}

export interface Tag {
  color?: string;
  id?: number;
  name?: string;
  [property: string]: any;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  [property: string]: any;
}

export interface ActivitiesRequest {
  category_id?: number;
  organizer_id?: number;
  page?: number;
  page_size?: number;
  sort?: string;
  status?: number;
  [property: string]: any;
}