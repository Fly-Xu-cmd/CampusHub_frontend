export interface wait {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  items: Item[];
  page: number;
  pageSize: number;
  total: number;
  [property: string]: any;
}

export interface Item {
  /**
   * 活动id
   */
  id: number;
  /**
   * 活动图片
   */
  imageUrl: string;
  /**
   * 活动名称
   */
  name: string;
  /**
   * 活动状态
   */
  status: string;
  /**
   * 活动时间
   */
  time: string;
  [property: string]: any;
}

export interface WaitRequest {
  /**
   * 页数
   */
  page?: number;
  /**
   * 页码
   */
  pageSize?: number;
  /**
   * 待参加 /已参加
   */
  type?: string;
  [property: string]: any;
}