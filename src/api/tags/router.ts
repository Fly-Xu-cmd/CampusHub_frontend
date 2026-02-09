import { get } from "@/utils/http";
import type { InterestTag } from "@/types/modules/profile";

const apiUrls = {
  tags: "/api/v1/interests/tags",
};

export interface TagsResponse {
  interestTags: InterestTag[];
}

/**
 * 获取兴趣标签列表
 */
export const getTags = () => {
  return get<Response<TagsResponse>>(apiUrls.tags);
};
