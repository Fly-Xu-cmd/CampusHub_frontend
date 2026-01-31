export interface UserState {
  activities_num: number; // 参加活动数
  age: string;
  avatar_url: string;
  gender: string;
  initiate_num: number; // 发起活动数
  introduction: string;
  nickname: string;
  qq_email: string;
  user_id: number;
  [property: string]: any;
}
