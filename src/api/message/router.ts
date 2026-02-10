import { get } from "@/utils/http";
import type { notifications } from "@/types/modules/message/notifications";
import type { groups } from "@/types/modules/message/groups";
import type { title } from "@/types/modules/message/title";
import type { members } from "@/types/modules/message/members";
import type { status } from "@/types/modules/message/status";
import type { history } from "@/types/modules/message/history";
import type { offline } from "@/types/modules/message/offline";

const apiUrls = {
  getNotifications: "/api/notifications",
  getGroups: "/api/users",
  getTitle: "/api/groups",
  getMembers: "/api/groups",
  getStatus: "/api/users/status",
  getHistory: "/api/messages",
  getOffline: "/api/messages/offline",
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

// 获取群聊成员
export const getMembers = (group_id: string) => {
  return get<members>(apiUrls.getMembers + `/${group_id}/members`);
};

// 获取用户状态
export const getStatus = (user_id: number) => {
  return get<status>(apiUrls.getStatus + `?user_id=${user_id}`);
};

// 获取群聊历史消息
export const getHistory = (group_id: string, before_id: string) => {
  return get<history>(apiUrls.getHistory + `?group_id=${group_id}&before_id=${before_id}&limit=10`);
};

// 获取离线消息
export const getOffline = (user_id: number, after_time: string) => {
  return get<offline>(apiUrls.getOffline + `?user_id=${user_id}&after_time=${after_time}`);
};
