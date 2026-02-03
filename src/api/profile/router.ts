import { get, post } from "@/utils/http";
import type {
  GetStudentAuthProgressData,
  PostUserDetailsRequest,
  PostUserInterestsData,
  PostUserInterestsRequest,
  PostUserPasswordData,
  PostUserPasswordRequest,
  UserDetailsData,
  PostStudentAuthRequest,
  PostStudentAuthData,
  PostStudentAuthConfirmRequest,
  PostStudentAuthConfirmData,
  PostStudentAuthCancelRequest,
  PostStudentAuthCancelData,
  CaptchaConfigData,
  PostCaptchaRequest,
  PostQqCodeRequest,
  PostCaptchaData,
  PostQqCodeData,
  PostQqCodeConfirmData,
  PostQqCodeConfirmRequest,
} from "@/types/modules/profile";

const apiUrls = {
  getProfile: "/api/v1/users/details",
  updateProfile: "/api/v1/users/details",
  updateInterests: "/api/interests",
  updatePassword: "/api/v1/users/info/password",
  getAuthProgress: "/api/v1/verify/student/current",
  postStudentAuth: "/api/v1/verify/student/apply",
  postStudentAuthConfirm: "/api/v1/verify/student/confirm",
  postStudentAuthCancel: "/api/v1/verify/student/cancel",
  getCaptchaConfig: "/api/v1/captcha/config",
  postCaptcha: "/api/v1/captcha",
  QqCode: "/api/v1/qq_code",
};

// 获取用户详情
export const getProfile = () => {
  return get<Response<UserDetailsData>>(apiUrls.getProfile);
};

// 更新用户详情
export const updateProfile = (data: PostUserDetailsRequest) => {
  return post<Response<UserDetailsData>>(apiUrls.updateProfile, data);
};

// 更新用户兴趣标签
export const updateInterests = (data: PostUserInterestsRequest) => {
  return post<Response<PostUserInterestsData>>(apiUrls.updateInterests, data);
};

// 修改用户密码
export const updatePassword = (data: PostUserPasswordRequest) => {
  return post<Response<PostUserPasswordData>>(apiUrls.updatePassword, data);
};

// 获取学生认证当前进度
export const getAuthProgress = () => {
  return get<Response<GetStudentAuthProgressData>>(apiUrls.getAuthProgress);
};

// 提交学生认证申请
export const postStudentAuth = (data: PostStudentAuthRequest) => {
  return post<Response<PostStudentAuthData>>(apiUrls.postStudentAuth, data);
};

// 确认学生认证申请
export const postStudentAuthConfirm = (data: PostStudentAuthConfirmRequest) => {
  return post<Response<PostStudentAuthConfirmData>>(
    apiUrls.postStudentAuthConfirm,
    data,
  );
};

// 取消学生认证申请
export const postStudentAuthCancel = (data: PostStudentAuthCancelRequest) => {
  return post<Response<PostStudentAuthCancelData>>(
    apiUrls.postStudentAuthCancel,
    data,
  );
};

// 获取验证码配置
export const getCaptchaConfig = () => {
  return get<Response<CaptchaConfigData>>(apiUrls.getCaptchaConfig);
};

// 提交验证码
export const postCaptcha = (data: PostCaptchaRequest) => {
  return post<Response<PostCaptchaData>>(apiUrls.postCaptcha, data);
};

// 获取QQ验证码
export const getQqCode = (params: PostQqCodeRequest) => {
  return get<Response<PostQqCodeData>>(apiUrls.QqCode, { data: params });
};

// 提交QQ验证码
export const postQqCodeConfirm = (data: PostQqCodeConfirmRequest) => {
  return post<Response<PostQqCodeConfirmData>>(apiUrls.QqCode, data);
};
