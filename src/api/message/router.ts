import { get } from "@/utils/http";
import type { notifications } from "@/types/modules/message/notifications";
import type { groups } from "@/types/modules/message/groups";

const apiUrls = {
  getNotifications: "/api/notifications",
  getGroups: "/api/groups",
};

// 获取通知列表
export const getNotifications = () => {
  return get<notifications>(apiUrls.getNotifications);
};

// 获取群聊列表
export const getGroups = () => {
  return get<groups>(apiUrls.getGroups);
};
