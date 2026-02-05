export interface detail {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  activity_end_time: string;
  activity_start_time: string;
  address_detail: string;
  category_id: number;
  category_name: string;
  contact_phone: string;
  content: string;
  cover_type: number;
  cover_url: string;
  created_at: string;
  current_participants: number;
  id: number;
  latitude: number;
  location: string;
  longitude: number;
  max_participants: number;
  min_credit_score: number;
  organizer_avatar: string;
  organizer_id: number;
  organizer_name: string;
  register_end_time: string;
  register_start_time: string;
  reject_reason: string;
  require_approval: boolean;
  require_student_verify: boolean;
  status: number;
  status_text: string;
  tags: Tag[];
  title: string;
  updated_at: string;
  view_count: number;
  [property: string]: any;
}

export interface Tag {
  color: string;
  id: number;
  name: string;
  [property: string]: any;
}