export interface title {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  activity_id: number;
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 群组id
   */
  group_id: string;
  /**
   * 群人数
   */
  member_count: number;
  /**
   * 群名称
   */
  name: string;
  owner_id: number;
  /**
   * 群状态
   */
  status: number;
  [property: string]: any;
}