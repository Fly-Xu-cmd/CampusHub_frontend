export interface user {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  joinedActivities: JoinedActivities;
  publishedActivities: PublishedActivities;
  tags: Tag[];
  userInfo: UserInfo;
  [property: string]: any;
}

export interface JoinedActivities {
  list: JoinedActivitiesList[];
  total: number;
  [property: string]: any;
}

export interface JoinedActivitiesList {
  id: number;
  imageUrl: string;
  name: string;
  status: string;
  time: string;
  [property: string]: any;
}

export interface PublishedActivities {
  list: PublishedActivitiesList[];
  total: number;
  [property: string]: any;
}

export interface PublishedActivitiesList {
  id: number;
  imageUrl: string;
  name: string;
  status: string;
  time: string;
  [property: string]: any;
}

export interface Tag {
  id: number;
  tagColor: string;
  tagDesc: string;
  tagIcon: string;
  tagName: string;
  [property: string]: any;
}

export interface UserInfo {
  age: number;
  avatarUrl: string;
  gender: number;
  introduction: string;
  nickname: string;
  userId: number;
  [property: string]: any;
}