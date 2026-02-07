import { get } from "@/utils/http";
import type { InterestTag } from "@/types/modules/profile";

const apiUrls = {
  tags: "/api/v1/activity/tags",
};

export interface TagsResponse {
  list: InterestTag[];
}

/**
 * 获取活动标签列表
 */
export const getTags = () => {
  return get<Response<TagsResponse>>(apiUrls.tags);
};
