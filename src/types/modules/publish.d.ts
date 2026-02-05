export interface Request {
    activity_end_time: string;
    activity_start_time: string;
    address_detail: string;
    category_id: number;
    contact_phone: string;
    content: string;
    cover_type: number;
    cover_url: string;
    is_draft: boolean;
    latitude: number;
    location: string;
    longitude: number;
    max_participants: number;
    min_credit_score: number;
    register_end_time: string;
    register_start_time: string;
    require_approval: boolean;
    require_student_verify: boolean;
    tag_ids: number[];
    title: string;
    [property: string]: any;
}

export interface Response {
    code: number;
    data: Data;
    message: string;
    [property: string]: any;
}

export interface Data {
    id: number;
    status: number;
    [property: string]: any;
}