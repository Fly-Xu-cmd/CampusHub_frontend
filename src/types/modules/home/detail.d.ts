export interface detail {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  activityEndTime: string;
  activityStartTime: string;
  addressDetail: string;
  categoryId: number;
  categoryName: string;
  contactPhone: string;
  content: string;
  coverType: number;
  coverUrl: string;
  currentParticipants: number;
  id: number;
  latitude: number;
  location: string;
  longitude: number;
  maxParticipants: number;
  minCreditScore: number;
  organizerAvatar: string;
  organizerId: number;
  organizerName: string;
  registerEndTime: string;
  registerStartTime: string;
  rejectReason: string;
  requireApproval: boolean;
  requireStudentVerify: boolean;
  status: number;
  statusText: string;
  tags: Tag[];
  title: string;
  updatedAt: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  version: number;
  [property: string]: any;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  [property: string]: any;
}