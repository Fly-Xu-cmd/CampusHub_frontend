export interface Response {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  activitiesNum: number;
  age: string;
  avatarUrl: string;
  gender: string;
  initiateNum: number;
  interestTags: InterestTag[];
  introduction: string;
  nickname: string;
  userId: number;
  [property: string]: any;
}

export interface InterestTag {
  id: number;
  tagDesc: string;
  tagIcon: string;
  tagName: string;
  [property: string]: any;
}
