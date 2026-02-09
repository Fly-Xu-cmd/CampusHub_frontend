import { get } from "@/utils/http";
import type { ActivityListResponse } from "@/types/modules/activity";

const apiUrls = {
  getActivityList: "/api/v1/activity/list",
  getMyCreated: "/api/v1/activity/my/created",
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
  pageSize = 12
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
  return get<Response<ActivityListResponse>>(apiUrls.getMyCreated, {
    data: { page, pageSize },
  });
};
