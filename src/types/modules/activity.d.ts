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

// 我发布的活动

export interface MyCreatedActivity {
  list: List[];
  pagination: Pagination;
  [property: string]: any;
}

export interface List {
  /**
   * 活动开始时间
   */
  activityStartTime: number;
  /**
   * 活动雷暴
   */
  categoryName: string;
  /**
   * 封面类型
   */
  coverType: number;
  /**
   * 活动图片url
   */
  coverUrl: string;
  /**
   * 创建时间
   */
  createdAt: number;
  /**
   * 当前报名人数
   */
  currentParticipants: number;
  /**
   * 活动id
   */
  id: number;
  /**
   * 活动地点
   */
  location: string;
  /**
   * 最大人数
   */
  maxParticipants: number;
  /**
   * 组织者头像
   */
  organizerAvatar: string;
  /**
   * 组织者名称
   */
  organizerName: string;
  /**
   * 活动状态
   */
  status: number;
  /**
   * 状态文本
   */
  statusText: string;
  /**
   * 标签列表
   */
  tags: Tag[];
  /**
   * 活动标题
   */
  title: string;
  viewCount: number;
  [property: string]: any;
}

export interface Tag {
  color: string;
  id: number;
  name: string;
  [property: string]: any;
}

export interface Pagination {
  /**
   * 页数
   */
  page: number;
  /**
   * 一页多少个
   */
  pageSize: number;
  /**
   * 总共多少
   */
  total: number;
  /**
   * 总共多少页
   */
  totalPages: number;
  [property: string]: any;
}
