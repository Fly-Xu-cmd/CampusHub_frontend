import { get } from "@/utils/http";
import type { Response } from "@/types/modules/profile";
const apiUrls = {
  getProfile: "/api/v1/users/details",

};

// 获取用户详情
export const getProfile = () => {
  return get<Response>(apiUrls.getProfile);
};

