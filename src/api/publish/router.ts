import { post, get, upload } from "@/utils/http";

import type { Request, Response } from "@/types/modules/publish";

const apiUrls = {
    postPublish: "/api/v1/activity/",
    getTags: "/api/v1/activity/tags",
    postId: "/api/v1/images/upload",
};

// 发布活动
export const postPublish = (data: Request) => {
    return post<Response>(apiUrls.postPublish, data);
};

// 获取活动标签
export const getTags = () => {
    return get(apiUrls.getTags);
};

// 上传图片
export const postId = (file: string | File) => {
    return upload<Response>(apiUrls.postId, { file: file, bizType: "avatar" }, ["file"]);
};


