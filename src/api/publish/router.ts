import { post, get } from "@/utils/http";

import type { Request, Response } from "@/types/modules/publish";

const apiUrls = {
    postPublish: "/api/v1/activity/",
    getTags: "/api/v1/activity/tags",
};

// 发布活动
export const postPublish = (data: Request) => {
    return post<Response>(apiUrls.postPublish, data);
};

// 获取活动标签
export const getTags = () => {
    return get(apiUrls.getTags);
};
