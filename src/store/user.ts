import { defineStore } from "pinia";
import type { UserState } from "@/types/modules/user";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user_id: 0,
    activities_num: 0,
    age: "",
    avatar_url: "",
    gender: "",
    initiate_num: 0,
    introduction: "",
    latitude_longitude: "",
    nickname: "",
    qq_email: "",
    token: "",
    refresh_token: "",
  }),

  getters: {
    userInfo(): Partial<UserState> {
      return {
        user_id: this.user_id,
        activities_num: this.activities_num,
        age: this.age,
        avatar_url: this.avatar_url,
        gender: this.gender,
        initiate_num: this.initiate_num,
        introduction: this.introduction,
        latitude_longitude: this.latitude_longitude,
        nickname: this.nickname,
        qq_email: this.qq_email,
      };
    },

    isAuthenticated(): boolean {
      return this.user_id !== 0;
    },

    hasAvatar(): boolean {
      return !!this.avatar_url;
    },
  },

  actions: {
    /**
     * 登录
     * @param userData 用户数据
     * @param token 认证令牌
     */
    login(userData: Partial<UserState>, token: string, refresh_token: string) {
      this.user_id = userData.user_id || 0;
      this.activities_num = userData.activities_num || 0;
      this.age = userData.age || "";
      this.avatar_url = userData.avatar_url || "";
      this.gender = userData.gender || "";
      this.initiate_num = userData.initiate_num || 0;
      this.introduction = userData.introduction || "";
      this.latitude_longitude = userData.latitude_longitude || "";
      this.nickname = userData.nickname || "";
      this.qq_email = userData.qq_email || "";
      this.token = token;
      this.refresh_token = refresh_token;

      // 存储 token 到本地
      uni.setStorageSync("token", token);
      uni.setStorageSync("refresh_token", refresh_token);

      // 存储用户信息到本地
      uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
    },

    /**
     * 登出
     */
    logout() {
      // 重置状态
      this.user_id = 0;
      this.activities_num = 0;
      this.age = "";
      this.avatar_url = "";
      this.gender = "";
      this.initiate_num = 0;
      this.introduction = "";
      this.latitude_longitude = "";
      this.nickname = "";
      this.qq_email = "";
      this.token = "";
      this.refresh_token = "";

      // 清除本地存储
      uni.removeStorageSync("token");
      uni.removeStorageSync("refresh_token");
      uni.removeStorageSync("userInfo");
    },

    /**
     * 更新用户信息
     * @param userData 用户数据
     */
    updateUserInfo(userData: Partial<UserState>) {
      this.user_id = userData.user_id || this.user_id;
      this.activities_num = userData.activities_num || this.activities_num;
      this.age = userData.age || this.age;
      this.avatar_url = userData.avatar_url || this.avatar_url;
      this.gender = userData.gender || this.gender;
      this.initiate_num = userData.initiate_num || this.initiate_num;
      this.introduction = userData.introduction || this.introduction;
      this.latitude_longitude =
        userData.latitude_longitude || this.latitude_longitude;
      this.nickname = userData.nickname || this.nickname;
      this.qq_email = userData.qq_email || this.qq_email;

      // 更新本地存储
      uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
    },

    /**
     * 从本地存储恢复用户状态
     */
    restoreFromStorage() {
      const token = uni.getStorageSync("token");
      const userInfoStr = uni.getStorageSync("userInfo");
      const refresh_token = uni.getStorageSync("refresh_token");

      if (token && userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          this.user_id = userInfo.user_id || 0;
          this.activities_num = userInfo.activities_num || 0;
          this.age = userInfo.age || "";
          this.avatar_url = userInfo.avatar_url || "";
          this.gender = userInfo.gender || "";
          this.initiate_num = userInfo.initiate_num || 0;
          this.introduction = userInfo.introduction || "";
          this.latitude_longitude = userInfo.latitude_longitude || "";
          this.nickname = userInfo.nickname || "";
          this.qq_email = userInfo.qq_email || "";
          this.token = token;
          this.refresh_token = refresh_token;
        } catch (error) {
          console.error("恢复用户状态失败:", error);
          this.logout();
        }
      }
    },

    /**
     * 清除用户状态
     */
    clearUserState() {
      this.user_id = 0;
      this.activities_num = 0;
      this.age = "";
      this.avatar_url = "";
      this.gender = "";
      this.initiate_num = 0;
      this.introduction = "";
      this.latitude_longitude = "";
      this.nickname = "";
      this.qq_email = "";
      this.token = "";
      this.refresh_token = "";

      // 清除本地存储
      uni.removeStorageSync("token");
      uni.removeStorageSync("refresh_token");
      uni.removeStorageSync("userInfo");
    },

    /**
     * 检查登录状态
     * @returns 是否登录
     */
    checkLoginStatus(): boolean {
      if (!this.user_id || !this.token) {
        // 尝试从本地存储恢复
        this.restoreFromStorage();
      }
      return this.user_id !== 0 && !!this.token;
    },
  },
});
