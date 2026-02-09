export interface UserInfo {
  activitiesNum: number;
  age: string;
  avatarUrl: string;
  credit: number;
  gender: string;
  initiateNum: number;
  interestTags: InterestTag[];
  introduction: string;
  isStudentVerified: boolean;
  nickname: string;
  userId: number;
  qqEmail: string;
  [property: string]: any;
}

export interface InterestTag {
  id: number;
  tagDesc: string;
  tagIcon: string;
  tagName: string;
  [property: string]: any;
}
