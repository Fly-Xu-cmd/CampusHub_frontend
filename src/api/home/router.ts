import { get } from "@/utils/http";
import type { categories } from "@/types/modules/home/categories";
import type { activities } from "@/types/modules/home/activities";
import type { search } from "@/types/modules/home/search";

const apiUrls = {
  getActivityCategoryList: "/api/v1/categories",
  getActivityList: "/api/v1/activities",
};

// 获取活动分类列表
export const getActivityCategoryList = () => {
  return get<categories>(apiUrls.getActivityCategoryList);
};

// 获取活动列表
export const getActivityList = () => {
  return get<activities>(apiUrls.getActivityList);
};
