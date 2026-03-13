export interface ForgotPasswordRequest {
  /**
   * 密码
   */
  new_password: string;
  /**
   * 邮箱验证码
   */
  qq_code: string;
  /**
   * qq邮箱
   */
  qq_email: string;
  [property: string]: any;
}
