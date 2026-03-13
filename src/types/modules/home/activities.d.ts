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
  activityStartTime: number;
  categoryName: string;
  coverType: number;
  coverUrl: string;
  createdAt: number;
  currentParticipants: number;
  id: number;
  location: string;
  maxParticipants: number;
  organizerAvatar: string;
  organizerName: string;
  registrationStatus: number;
  registrationStatusText: string;
  status: number;
  statusText: string;
  tags: Tag[];
  title: string;
  viewCount: number;
  [property: string]: any;
}

export interface Tag {
  color: string;
  icon: string;
  id: number;
  name: string;
  [property: string]: any;
}

export interface Pagination {
  page: number;
  pageSize: number;
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