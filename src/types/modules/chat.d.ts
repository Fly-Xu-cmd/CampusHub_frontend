// ==================== WebSocket 消息类型 ====================

/** WebSocket 基础消息结构 */
export interface WSMessage {
  type: string;
  message_id: string;
  timestamp: number;
  data?: any;
}

/** 认证消息 */
export interface WSAuthMessage extends WSMessage {
  type: "auth";
  data: {
    token: string;
  };
}

/** 认证成功 */
export interface WSAuthSuccessMessage extends WSMessage {
  type: "auth_success";
}

/** 认证失败 */
export interface WSAuthFailedMessage extends WSMessage {
  type: "auth_failed";
  data: {
    code: number;
    message: string;
  };
}

/** 发送消息 */
export interface WSSendMessage extends WSMessage {
  type: "send_message";
  data: {
    group_id: string;
    msg_type: 1 | 2; // 1-文字, 2-图片
    content?: string; // 文本内容（msg_type=1时）
    image_url?: string; // 图片URL（msg_type=2时）
  };
}

/** 加入群聊 */
export interface WSJoinGroupMessage extends WSMessage {
  type: "join_group";
  data: {
    group_id: string;
  };
}

/** 离开群聊 */
export interface WSLeaveGroupMessage extends WSMessage {
  type: "leave_group";
  data: {
    group_id: string;
  };
}

/** 标记已读 */
export interface WSMarkReadMessage extends WSMessage {
  type: "mark_read";
  data: {
    group_id: string;
    message_id: string;
  };
}

/** 新消息 */
export interface WSNewMessageData {
  message_id: string;
  group_id: string;
  sender_id: number;
  sender_name: string;
  msg_type: 1 | 2; // 1-文字, 2-图片
  content?: string;
  image_url?: string;
  created_at: number;
}

export interface WSNewMessageMessage extends WSMessage {
  type: "new_message";
  data: WSNewMessageData;
}

/** 系统通知 */
export interface WSNotificationData {
  notification_id: string;
  type: string;
  title: string;
  content: string;
  created_at: number;
}

export interface WSNotificationMessage extends WSMessage {
  type: "notification";
  data: WSNotificationData;
}

/** 错误消息 */
export interface WSErrorMessage extends WSMessage {
  type: "error";
  data: {
    code: number;
    message: string;
  };
}

/** 消息确认 */
export interface WSAckMessage extends WSMessage {
  type: "ack";
  data: {
    message_id: string;
    success: boolean;
  };
}

/** 心跳 */
export interface WSPingMessage extends WSMessage {
  type: "ping";
}

export interface WSPongMessage extends WSMessage {
  type: "pong";
}

// ==================== HTTP API 类型 ====================

/** 消息类型 */
export enum MessageType {
  Text = 1, // 文字
  Image = 2, // 图片
}

/** 聊天消息 */
export interface ChatMessage {
  message_id: string;
  group_id: string;
  sender_id: number;
  sender_name: string;
  msg_type: MessageType;
  content?: string;
  image_url?: string;
  created_at: string;
}

/** 消息历史响应 */
export interface MessagesHistoryData {
  messages: ChatMessage[];
  has_more: boolean;
}

/** 群组信息 */
export interface GroupInfo {
  group_id: string;
  activity_id: number;
  name: string;
  owner_id: number;
  member_count: number;
  status: number; // 1-正常 2-已解散
  created_at: string;
}

/** 群成员角色 */
export enum GroupMemberRole {
  Owner = "owner", // 群主
  Admin = "admin", // 管理员
  Member = "member", // 普通成员
}

/** 群成员信息 */
export interface GroupMember {
  user_id: number;
  username: string;
  avatar: string;
  role: GroupMemberRole;
  joined_at: string;
}

/** 群成员列表响应 */
export interface GroupMembersData {
  members: GroupMember[];
  total: number;
  page: number;
  page_size: number;
}

/** 用户群聊列表项 */
export interface UserGroupItem {
  group_id: string;
  activity_id: string;
  name: string;
  owner_id: string;
  member_count: number;
  status: number;
  role: GroupMemberRole;
  joined_at: string;
  last_message?: string;
  last_message_at?: string;
}

/** 用户群聊列表响应 */
export interface UserGroupsData {
  groups: UserGroupItem[];
  total: number;
  page: number;
  page_size: number;
}

/** 系统通知 */
export interface Notification {
  notification_id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean; // 0-未读 1-已读
  created_at: string;
}

/** 通知列表响应 */
export interface NotificationsData {
  total: number;
  unread_count: number;
  notifications: Notification[];
  page?: number;
  page_size?: number;
}

/** 用户状态 */
export interface UserStatusData {
  is_online: boolean;
  last_seen: number;
  last_online_at: number;
  last_offline_at: number;
}

/** 离线消息响应 */
export interface OfflineMessagesData {
  messages: ChatMessage[];
}

// ==================== 学生认证状态更新 ====================

/** 学生认证状态更新数据 */
export interface WSStudentAuthUpdateData {
  verify_id: number;
  status: number;
  status_desc: string;
  need_action: string;
  reject_reason?: string;
  verify_data?: {
    real_name?: string;
    school_name?: string;
    department?: string;
    admission_year?: string;
    student_id?: string;
    verified_at?: string;
  };
}

/** 学生认证状态更新消息 */
export interface WSStudentAuthUpdateMessage extends WSMessage {
  type: "student_auth_update";
  data: WSStudentAuthUpdateData;
}

// ==================== 认证进度实时更新 ====================

/** 认证进度实时更新数据 */
export interface WSVerifyProgressData {
  verify_id: number;
  status: number;
  refresh: boolean;
  status_desc?: string;
  need_action?: number;
  reject_reason?: string;
}

/** 认证进度实时更新消息 */
export interface WSVerifyProgressMessage extends WSMessage {
  type: "verify_progress";
  data: WSVerifyProgressData;
}
