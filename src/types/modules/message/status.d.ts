export interface status {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  /**
   * 当前是否在线
   */
  is_online: boolean;
  /**
   * 最后离线时间（用作 `after_time`）
   */
  last_offline_at: number;
  /**
   * 最后上线时间
   */
  last_online_at: number;
  /**
   * 最后活跃时间
   */
  last_seen: number;
  [property: string]: any;
}