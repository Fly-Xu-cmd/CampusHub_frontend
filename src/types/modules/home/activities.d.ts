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
  id?: number;
  title?: string;
  coverUrl?: string;
  coverType?: number;
  categoryName?: string;
  organizerName?: string;
  organizerAvatar?: string;
  activityStartTime?: string;
  location?: string;
  currentParticipants?: number;
  maxParticipants?: number;
  status?: number;
  statusText?: string;
  tags?: Tag[];
  
  viewCount?: number;
  createdAt?: number;
  [property: string]: any;
}

export interface Tag {
  id?: number;
  name?: string;
  color?: string; 
  [property: string]: any;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  totalPages: number;
  [property: string]: any;
}

export interface ActivitiesRequest {
  categoryId?: number;
  organizerId?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
  status?: number;
  [property: string]: any;
}