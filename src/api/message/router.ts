import { get } from "@/utils/http";
import type { notifications } from "@/types/modules/message/notifications";
import type { groups } from "@/types/modules/message/groups";
import type { title } from "@/types/modules/message/title";

const apiUrls = {
  getNotifications: "/api/notifications",
  getGroups: "/api/users",
  getTitle: "/api/groups",
};

// 获取通知列表
export const getNotifications = (user_id: number) => {
  return get<notifications>(apiUrls.getNotifications + `?user_id=${user_id}`);
};

// 获取群聊列表
export const getGroups = (user_id: number) => {
  return get<groups>(apiUrls.getGroups + `/${user_id}/groups`);
};

// 获取群聊名称(信息)
export const getTitle = (group_id: string) => {
  return get<title>(apiUrls.getTitle + `/${group_id}`);
};
