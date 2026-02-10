import { get, post } from "@/utils/http";
import type { notifications } from "@/types/modules/message/notifications";
import type { groups } from "@/types/modules/message/groups";
import type { title } from "@/types/modules/message/title";
import type { members } from "@/types/modules/message/members";
import type { status } from "@/types/modules/message/status";
import type { history } from "@/types/modules/message/history";
import type { offline } from "@/types/modules/message/offline";
import type { Response } from "@/utils/http";

const apiUrls = {
  getNotifications: "/api/notifications",
  getNotificationsUnreadCount: "/api/notifications/unread-count",
  markNotificationsRead: "/api/notifications/read",
  markNotificationsReadAll: "/api/notifications/read-all",
  getGroups: "/api/users",
  getTitle: "/api/groups",
  getMembers: "/api/groups",
  getStatus: "/api/users/status",
  getHistory: "/api/messages",
  getOffline: "/api/messages/offline",
};

// ==================== 系统通知相关 ====================

/**
 * 获取通知列表
 * @param user_id 用户ID
 * @param page 页码
 * @param page_size 每页数量
 */
export const getNotifications = (user_id: number, page = 1, page_size = 20) => {
  return get<Response<notifications>>(
    apiUrls.getNotifications + `?user_id=${user_id}&page=${page}&page_size=${page_size}`
  );
};

/**
 * 获取未读通知数量
 * @param user_id 用户ID
 */
export const getNotificationsUnreadCount = (user_id: number) => {
  return get<Response<{ count: number }>>(
    apiUrls.getNotificationsUnreadCount + `?user_id=${user_id}`
  );
};

/**
 * 标记通知已读
 * @param user_id 用户ID
 * @param notification_ids 通知ID数组
 */
export const markNotificationsRead = (user_id: number, notification_ids: string[]) => {
  return post<Response<{}>>(apiUrls.markNotificationsRead, {
    data: {
      user_id,
      notification_ids,
    },
  });
};

/**
 * 全部标记已读
 * @param user_id 用户ID
 */
export const markNotificationsReadAll = (user_id: number) => {
  return post<Response<{}>>(apiUrls.markNotificationsReadAll, {
    data: {
      user_id,
    },
  });
};

// ==================== 群聊相关 ====================

/**
 * 获取用户群聊列表
 * @param user_id 用户ID
 * @param page 页码
 * @param page_size 每页数量
 */
export const getGroups = (user_id: number, page = 1, page_size = 20) => {
  return get<Response<groups>>(
    apiUrls.getGroups + `/${user_id}/groups?page=${page}&page_size=${page_size}`
  );
};

/**
 * 获取群聊信息
 * @param group_id 群组ID
 */
export const getGroupInfo = (group_id: string) => {
  return get<Response<title>>(apiUrls.getTitle + `/${group_id}`);
};

/**
 * 获取群聊成员列表
 * @param group_id 群组ID
 * @param page 页码
 * @param page_size 每页数量
 */
export const getGroupMembers = (group_id: string, page = 1, page_size = 20) => {
  return get<Response<members>>(
    apiUrls.getMembers + `/${group_id}/members?page=${page}&page_size=${page_size}`
  );
};

/**
 * 获取用户在线状态
 * @param user_id 用户ID
 */
export const getUserStatus = (user_id: number) => {
  return get<Response<status>>(apiUrls.getStatus + `?user_id=${user_id}`);
};

// ==================== 消息相关 ====================

/**
 * 获取群聊历史消息
 * @param group_id 群组ID
 * @param before_id 查询在这条消息之前的历史消息
 * @param limit 限制返回的消息数量，默认10
 */
export const getGroupHistory = (group_id: string, before_id?: string, limit = 10) => {
  let url = apiUrls.getHistory + `?group_id=${group_id}&limit=${limit}`;
  if (before_id) {
    url += `&before_id=${before_id}`;
  }
  return get<Response<history>>(url);
};

/**
 * 获取用户离线消息
 * @param user_id 用户ID
 * @param after_time 离线时间
 */
export const getOfflineMessages = (user_id: number, after_time: string) => {
  return get<Response<offline>>(
    apiUrls.getOffline + `?user_id=${user_id}&after_time=${after_time}`
  );
};

// ==================== 兼容旧接口名称 ====================

/**
 * @deprecated 使用 getGroupInfo 代替
 */
export const getTitle = getGroupInfo;

/**
 * @deprecated 使用 getGroupMembers 代替
 */
export const getMembers = getGroupMembers;

/**
 * @deprecated 使用 getUserStatus 代替
 */
export const getStatus = getUserStatus;

/**
 * @deprecated 使用 getGroupHistory 代替
 */
export const getHistory = getGroupHistory;

/**
 * @deprecated 使用 getOfflineMessages 代替
 */
export const getOffline = getOfflineMessages;
