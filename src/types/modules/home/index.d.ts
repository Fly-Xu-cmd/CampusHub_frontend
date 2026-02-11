export interface Request {
  /**
   * 用户id
   */
  user_id?: number;
  [property: string]: any;
}

export interface systemMessage {
  /**
   * 数量
   */
  count: number;
  [property: string]: any;
}
