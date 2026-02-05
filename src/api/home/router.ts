import { get } from "@/utils/http";
import type { categories } from "@/types/modules/home/categories";
import type { activities, ActivitiesRequest } from "@/types/modules/home/activities";
import type { search, SearchRequest } from "@/types/modules/home/search";

const apiUrls = {
  getActivityCategoryList: "/api/v1/categories",
  getActivityList: "/api/v1/activities",
  searchActivity: "/api/v1/activities/search",
};

// 获取活动分类列表
export const getActivityCategoryList = () => {
  return get<categories>(apiUrls.getActivityCategoryList);
};

// 获取活动列表
export const getActivityList = (params: ActivitiesRequest) => {
  return get<activities>(`${apiUrls.getActivityList}?category_id=${params.category_id}`);
};

// 搜索活动
export const searchActivity = (params: SearchRequest) => {
  return get<search>(`${apiUrls.searchActivity}?q=${params.q}`);
};