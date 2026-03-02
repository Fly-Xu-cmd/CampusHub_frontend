/**
 * 信用分相关类型定义
 */

/** 信用变动类型 */
export enum CreditChangeType {
  REGISTER_INIT = 1, // 注册初始化
  NORMAL_PERFORMANCE = 2, // 正常履约
  EARLY_CANCEL = 3, // 提前取消
  EXPIRED_CANCEL = 4, // 临期取消
  NO_SHOW = 5, // 爽约/未签到
  SUCCESSFUL_EVENT = 6, // 圆满举办
  DELETE_ACTIVITY = 7, // 删除活动
  ADMIN_ADJUST = 99, // 管理员调整
}

/** 信用分变更记录 */
export interface CreditLog {
  id: number;
  userId: number;
  changeType: CreditChangeType;
  changeTypeName: string;
  delta: number; // 变动分值（正数加分，负数扣分）
  sourceId: string;
  reason: string;
  createdAt: number; // 变动时间戳（秒）
}

/** 信用分记录列表响应 */
export interface CreditLogsResponse {
  list: CreditLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** 信用分记录查询参数 */
export interface CreditLogsParams {
  changeType?: CreditChangeType;
  startTime?: number;
  endTime?: number;
  page?: number;
  pageSize?: number;
}
