export interface Request {
    title: string;
    coverUrl: string;
    coverType: number;
    content: string;
    categoryId: number;
    contactPhone: string;
    registerStartTime: number;
    registerEndTime: number;
    activityStartTime: number;
    activityEndTime: number;
    location: string;
    addressDetail: string;
    longitude: number;
    latitude: number;
    maxParticipants: number;
    requireApproval: boolean;
    requireStudentVerify: boolean;
    minCreditScore: number;
    tagIds: number[];
    isDraft: boolean;
    [property: string]: any;
}

export interface Response {
    code: number;
    data?: Data;
    message: string;
    [property: string]: any;
}

export interface Data {
    id: number;
    status: number;
    [property: string]: any;
}