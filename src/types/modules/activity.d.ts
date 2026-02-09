// 活动列表项（简化版，用于个人中心的待参加/已参加/我发起的）
export interface ActivityListItem {
  /**
   * 活动ID
   */
  id: number;
  /**
   * 活动名称
   */
  name: string;
  /**
   * 活动时间
   */
  time: string;
  /**
   * 活动状态
   */
  status: string;
  /**
   * 活动图片URL
   */
  imageUrl: string;
  [property: string]: any;
}

// 活动列表响应
export interface ActivityListResponse {
  /**
   * 总数
   */
  total: number;
  /**
   * 活动列表
   */
  items: ActivityListItem[];
  /**
   * 当前页码
   */
  page: number;
  /**
   * 每页数量
   */
  pageSize: number;
  [property: string]: any;
}
