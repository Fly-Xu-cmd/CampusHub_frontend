import { get } from "@/utils/http";
import type {
  ActivityListResponse,
  MyCreatedActivity,
} from "@/types/modules/activity";

const apiUrls = {
  getActivityList: "/api/v1/activity/list",
  getMyCreated: "/api/v1/activity/my/created",
  searchActivities: "/api/v1/activity/search",
};

/**
 * 搜索活动（用于核销）
 * @param keyword 搜索关键词
 * @param page 页码，默认1
 * @param pageSize 每页数量，默认10
 */
export const searchActivities = (
  keyword: string,
  page = 1,
  pageSize = 10,
) => {
  return get<Response<MyCreatedActivity>>(apiUrls.searchActivities, {
    data: { keyword, page, pageSize },
  });
};

/**
 * 获取待参加/已参加活动列表
 * @param type "待参加" | "已参加"
 * @param page 页码，默认1
 * @param pageSize 每页数量，默认12
 */
export const getActivityList = (
  type: "待参加" | "已参加",
  page = 1,
  pageSize = 12,
) => {
  return get<Response<ActivityListResponse>>(apiUrls.getActivityList, {
    data: { type, page, pageSize },
  });
};

/**
 * 获取我创建的活动列表
 * @param page 页码，默认1
 * @param pageSize 每页数量，默认12
 */
export const getMyCreated = (page = 1, pageSize = 12) => {
  return get<Response<MyCreatedActivity>>(apiUrls.getMyCreated, {
    data: { page, pageSize },
  });
};
