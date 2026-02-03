import { post } from "@/utils/http";
import type {
  LoginRequest,
  LoginData,
  RegisterRequest,
  RegisterData,
  LogoutData,
  LogoffData,
  LogoffRequest,
  RefreshTokenRequest,
  RefreshTokenData,
} from "@/types/modules/register";

const apiUrls = {
  login: "/api/v1/login",
  register: "/api/v1/register",
  logout: "/api/v1/logout",
  refreshToken: "/api/v1/refresh_token",
  logoff: "/api/v1/logoff",
};

/**
 * 认证相关 API 路由
 * 包含登录、注册、退出登录、刷新令牌和注销账号等功能
 */
export const authApi = {
  /**
   * 用户登录
   * @param data 登录请求数据
   * @returns 登录响应数据
   */
  async login(data: LoginRequest): Promise<Response<LoginData>> {
    try {
      return await post<Response<LoginData>>(apiUrls.login, data);
    } catch (error) {
      console.error("登录失败:", error);
      throw error;
    }
  },

  /**
   * 用户注册
   * @param data 注册请求数据
   * @returns 注册响应数据
   */
  async register(data: RegisterRequest): Promise<Response<RegisterData>> {
    try {
      return await post<Response<RegisterData>>(apiUrls.register, data);
    } catch (error) {
      console.error("注册失败:", error);
      throw error;
    }
  },

  /**
   * 用户退出登录
   * @returns 退出登录响应数据
   */
  async logout(): Promise<Response<LogoutData>> {
    try {
      return await post<Response<LogoutData>>(apiUrls.logout);
    } catch (error) {
      console.error("退出登录失败:", error);
      throw error;
    }
  },

  /**
   * 刷新认证令牌
   * @param data 刷新令牌请求数据
   * @returns 刷新令牌响应数据
   */
  async refreshToken(
    data: RefreshTokenRequest,
  ): Promise<Response<RefreshTokenData>> {
    try {
      return await post<Response<RefreshTokenData>>(apiUrls.refreshToken, data);
    } catch (error) {
      console.error("刷新令牌失败:", error);
      throw error;
    }
  },

  /**
   * 用户注销账号
   * @param data 注销账号请求数据
   * @returns 注销账号响应数据
   */
  async logoff(data: LogoffRequest): Promise<Response<LogoffData>> {
    try {
      return await post<Response<LogoffData>>(apiUrls.logoff, data);
    } catch (error) {
      console.error("注销账号失败:", error);
      throw error;
    }
  },
};
