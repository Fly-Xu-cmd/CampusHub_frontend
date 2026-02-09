export interface search {
  code: number;
  data: Data;
  list: string;
  message: string;
  [property: string]: any;
}

export interface Data {
  list: List[];
  queryTimeMs: number;
  total: number;
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

export interface SearchRequest {
  categoryId?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
  sort?: string;
  [property: string]: any;
}