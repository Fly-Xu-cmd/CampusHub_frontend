// 用户详情数据
export interface UserDetailsData {
  activitiesNum: number;
  age: string;
  avatarUrl: string;
  gender: string;
  initiateNum: number;
  interestTags: InterestTag[];
  introduction: string;
  nickname: string;
  userId: number;
  [property: string]: any;
}

export interface InterestTag {
  id: number;
  tagDesc: string;
  tagIcon: string;
  tagName: string;
  [property: string]: any;
}
// 更新用户详情请求数据
export interface PostUserDetailsRequest {
  age: number;
  gender: string;
  introduction: string;
  nickname: string;
  [property: string]: any;
}
// 更新用户兴趣标签请求数据
export interface PostUserInterestsData {
  interestTags: InterestTag[];
  userId: number;
  [property: string]: any;
}

export interface PostUserInterestsRequest {
  interestTagIds: number[];
  [property: string]: any;
}

// 修改用户密码请求数据
export interface PostUserPasswordRequest {
  newPassword: string;
  originPassword: string;
  [property: string]: any;
}

export interface PostUserPasswordData {
  user_id: number;
  [property: string]: any;
}

// 学生认证相关
export interface GetStudentAuthProgressData {
  /**
   * 是否可以提交新申请
   */
  can_apply?: boolean;
  /**
   * 是否可以取消
   */
  can_cancel?: boolean;
  /**
   * 是否可以确认/修改
   */
  can_confirm?: boolean;
  /**
   * 申请时间
   */
  created_at?: Date;
  /**
   * 是否有认证记录
   */
  has_record?: boolean;
  /**
   *
   * 前端应执行的动作（apply=显示申请表单,wait_ocr=等待OCR,confirm=显示确认页,wait_manual=等待人工审核,done=认证完成,rejected=被拒绝可重新申请）
   */
  need_action?: NeedAction;
  /**
   * 拒绝原因（被拒绝时返回）
   */
  reject_reason?: string;
  /**
   * 当前状态码（-1=未申请,0-初始,1-OCR审核中,2-待确认,3-人工审核,4-通过,5-拒绝,6-超时,7-取消）
   */
  status?: number;
  /**
   * 状态描述
   */
  status_desc?: string;
  /**
   * 最后更新时间
   */
  updated_at?: Date;
  /**
   * OCR识别数据（待确认/已通过时返回）
   */
  verify_data?: VerifyData;
  /**
   * 当前认证ID（无记录时为0）
   */
  verify_id?: number;
  [property: string]: any;
}

/**
 *
 * 前端应执行的动作（apply=显示申请表单,wait_ocr=等待OCR,confirm=显示确认页,wait_manual=等待人工审核,done=认证完成,rejected=被拒绝可重新申请）
 */
export enum NeedAction {
  Apply = "apply",
  Confirm = "confirm",
  Done = "done",
  Rejected = "rejected",
  WaitManual = "wait_manual",
  WaitOcr = "wait_ocr",
}

/**
 * OCR识别数据（待确认/已通过时返回）
 */
export interface VerifyData {
  /**
   * 入学年份
   */
  admission_year?: string;
  /**
   * 院系
   */
  department?: string;
  /**
   * 姓名
   */
  real_name?: string;
  /**
   * 学校名称
   */
  school_name?: string;
  /**
   * 学号
   */
  student_id?: string;
  /**
   * 认证通过时间（已通过时返回）
   */
  verified_at?: Date;
  [property: string]: any;
}

export interface PostStudentAuthRequest {
  admission_year: string;
  back_image_url: string;
  department: string;
  front_image_url: string;
  real_name: string;
  school_name: string;
  student_id: string;
  [property: string]: any;
}

export interface PostStudentAuthData {
  /**
   * 申请时间（ISO8601）
   */
  created_at?: Date;
  /**
   * 当前状态码（1=OCR审核中）
   */
  status?: number;
  /**
   * 状态描述
   */
  status_desc?: string;
  /**
   * 认证申请ID
   */
  verify_id?: number;
  [property: string]: any;
}

export interface PostStudentAuthConfirmRequest {
  /**
   * true=确认无误，false=需要修改
   */
  is_confirmed: boolean;
  /**
   * 用户修改后的数据（is_confirmed=false时必填）
   */
  modified_data?: ModifiedData;
  /**
   * 认证申请ID
   */
  verify_id: number;
  [property: string]: any;
}

/**
 * 用户修改后的数据（is_confirmed=false时必填）
 */
export interface ModifiedData {
  /**
   * 入学年份
   */
  admission_year?: string;
  /**
   * 院系
   */
  department?: string;
  /**
   * 姓名
   */
  real_name?: string;
  /**
   * 学校名称
   */
  school_name?: string;
  /**
   * 学号
   */
  student_id?: string;
  [property: string]: any;
}
export interface PostStudentAuthConfirmData {
  /**
   * 更新后的状态码（4=通过，3=人工审核）
   */
  new_status?: number;
  /**
   * 状态描述
   */
  new_status_desc?: string;
  /**
   * 认证申请ID
   */
  verify_id?: number;
  [property: string]: any;
}

export interface PostStudentAuthCancelRequest {
  /**
   * 取消原因（可选）
   */
  cancel_reason?: string;
  /**
   * 认证申请ID
   */
  verify_id: number;
  [property: string]: any;
}

export interface PostStudentAuthCancelData {
  /**
   * 更新后的状态码（7=已取消）
   */
  new_status?: number;
  /**
   * 状态描述
   */
  new_status_desc?: string;
  /**
   * 认证申请ID
   */
  verify_id?: number;
  [property: string]: any;
}

// 验证码相关
export interface CaptchaConfigData {
  captchaId: string;
  [property: string]: any;
}

export interface PostCaptchaRequest {
  captchaOutput: string;
  genTime: string;
  lotNumber: string;
  passToken: string;
  [property: string]: any;
}

export interface PostCaptchaData {
  isValid: boolean;
  [property: string]: any;
}

export interface PostQqCodeRequest {
  qq_email: string;
  [property: string]: any;
}

export interface PostQqCodeData {
  qqEmail: string;
  [property: string]: any;
}

export interface PostQqCodeConfirmRequest {
  qqCode: string;
  [property: string]: any;
}
export interface PostQqCodeConfirmData {
  isValid: boolean;
  [property: string]: any;
}
