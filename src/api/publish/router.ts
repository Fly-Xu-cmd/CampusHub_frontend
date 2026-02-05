import { post } from "@/utils/http";

import type { Request, Response } from "@/types/modules/publish";

const apiUrls = {
    postPublish: "/api/v1/activities",
};

// 发布活动
export const postPublish = (data: Request) => {
    return post<Response>(apiUrls.postPublish, data);
};
