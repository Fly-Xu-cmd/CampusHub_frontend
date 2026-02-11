export interface Response {
  code: number;
  data: Data;
  message: string;
  [property: string]: any;
}

export interface Data {
  /**
   * 核销结果
   */
  result: string;
  [property: string]: any;
}

export interface Request {
  /**
   * 活动ID
   */
  activityId: number;

  /**
   * 票券码
   */
  ticketCode: string;
  /**
   * totp验证码
   */
  totpCode: string;
  [property: string]: any;
}
