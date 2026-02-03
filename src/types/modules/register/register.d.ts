export interface Request {
  nickname: string;
  password: string;
  qqCode: string;
  qqEmail: string;
  [property: string]: any;
}

export interface Data {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
  [property: string]: any;
}

export interface UserInfo {
  activitiesNum: number;
  age: string;
  avatarUrl: string;
  gender: string;
  initiateNum: number;
  introduction: string;
  nickname: string;
  userId: number;
  [property: string]: any;
}
