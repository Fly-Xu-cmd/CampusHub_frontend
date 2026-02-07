import { get, post } from "@/utils/http";

import type { categories } from "@/types/modules/home/categories";
import type { activities, ActivitiesRequest } from "@/types/modules/home/activities";
import type { search, SearchRequest } from "@/types/modules/home/search";
import type { detail } from "@/types/modules/home/detail";
import type { sign } from "@/types/modules/home/sign";
import type { wait, WaitRequest } from "@/types/modules/home/wait";

const apiUrls = {
  getActivityCategoryList: "/api/v1/activity/categories",
  getActivityList: "/api/v1/activity/lists",
  searchActivity: "/api/v1/activity/search",
  getActivityDetail: "/api/v1/activity",
  getNotifications: "/api/notifications",
  signActivity: "/api/v1/activity/register",
  cancelSign: "/api/v1/activity/cancel",
  getWaitList: "/api/v1/activity/list",
};

// 获取活动分类列表
export const getActivityCategoryList = () => {
  console.log(get(apiUrls.getActivityCategoryList));
  return get<categories>(apiUrls.getActivityCategoryList);
};

// 获取活动列表
export const getActivityList = (params: ActivitiesRequest) => {
  return get<activities>(`${apiUrls.getActivityList}?categoryId=${params.categoryId}`);
};

// 搜索活动
export const searchActivity = (params: SearchRequest) => {
  return get<search>(`${apiUrls.searchActivity}?keyword=${params.keyword}`);
};

// 获取活动详情
export const getActivityDetail = (id: string) => {
  return get<detail>(`${apiUrls.getActivityDetail}/${id}`);
};

// 报名活动
export const signActivity = (id: number) => {
  return post<sign>(apiUrls.signActivity, {
    activityId: id,
  });
};

// 取消报名活动
export const cancelSign = (id: number) => {
  return post<sign>(apiUrls.cancelSign, {
    activityId: id,
  });
};

// 获取待参加/已参加活动列表
export const getWaitList = (params: WaitRequest) => {
  return get<wait>(`${apiUrls.getWaitList}?type=${params.type}&page=1&pageSize=12`);
};

