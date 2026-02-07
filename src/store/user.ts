import { defineStore } from "pinia";
import type { InterestTag, UserInfo } from "@/types/modules/user";

export const useUserStore = defineStore("user", {
  state: (): UserInfo => ({
    userId: 0,
    activitiesNum: 0,
    age: "",
    avatarUrl: "",
    gender: "",
    initiateNum: 0,
    interestTags: [],
    introduction: "",
    latitudeLongitude: "",
    nickname: "",
    qqEmail: "",
    token: "",
    refreshToken: "",
    accessToken: "",
  }),

  getters: {
    userInfo(): Partial<UserInfo> {
      return {
        userId: this.userId,
        activitiesNum: this.activitiesNum,
        age: this.age,
        avatarUrl: this.avatarUrl,
        gender: this.gender,
        initiateNum: this.initiateNum,
        introduction: this.introduction,
        latitudeLongitude: this.latitudeLongitude,
        nickname: this.nickname,
        qqEmail: this.qqEmail,
        interestTags: this.interestTags,
      };
    },

    isAuthenticated(): boolean {
      return this.userId !== 0;
    },

    hasAvatar(): boolean {
      return !!this.avatarUrl;
    },
  },

  actions: {
    /**
     * 登录
     * @param userData 用户数据
     * @param token 认证令牌
     */
    login(
      userData: Partial<UserInfo>,
      accessToken: string,
      refreshToken: string
    ) {
      console.log("login", userData, accessToken, refreshToken);
      this.updateUserInfo(userData);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      if (userData.interestTags) {
        this.setUserInterestTags(userData.interestTags);
      }

      // 存储 token 到本地
      uni.setStorageSync("accessToken", accessToken);
      uni.setStorageSync("refreshToken", refreshToken);

      // 存储用户信息到本地
      uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
    },

    /**
     * 登出
     */
    logout() {
      // 重置状态
      this.userId = 0;
      this.activitiesNum = 0;
      this.age = "";
      this.avatarUrl = "";
      this.gender = "";
      this.initiateNum = 0;
      this.introduction = "";
      this.latitudeLongitude = "";
      this.nickname = "";
      this.qqEmail = "";
      this.accessToken = "";
      this.refreshToken = "";

      // 清除本地存储
      uni.removeStorageSync("accessToken");
      uni.removeStorageSync("refreshToken");
      uni.removeStorageSync("userInfo");
    },

    /**
     * 更新用户信息
     * @param userData 用户数据
     */
    updateUserInfo(userData: Partial<UserInfo>) {
      this.userId = userData.userId || this.userId;
      this.activitiesNum = userData.activitiesNum || this.activitiesNum;
      this.age = userData.age || this.age;
      this.avatarUrl = userData.avatarUrl || this.avatarUrl;
      this.gender = userData.gender || this.gender;
      this.initiateNum = userData.initiateNum || this.initiateNum;
      this.introduction = userData.introduction || this.introduction;
      this.latitudeLongitude =
        userData.latitudeLongitude || this.latitudeLongitude;
      this.nickname = userData.nickname || this.nickname;
      this.qqEmail = userData.qqEmail || this.qqEmail;
      this.interestTags = userData.interestTags || this.interestTags;

      // 更新本地存储
      uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
    },

    /**
     * 从本地存储恢复用户状态
     */
    restoreFromStorage() {
      const accessToken = uni.getStorageSync("accessToken");
      const userInfoStr = uni.getStorageSync("userInfo");
      const refreshToken = uni.getStorageSync("refreshToken");

      if (accessToken && userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          this.userId = userInfo.userId || 0;
          this.activitiesNum = userInfo.activitiesNum || 0;
          this.age = userInfo.age || "";
          this.avatarUrl = userInfo.avatarUrl || "";
          this.gender = userInfo.gender || "";
          this.initiateNum = userInfo.initiateNum || 0;
          this.introduction = userInfo.introduction || "";
          this.latitudeLongitude = userInfo.latitudeLongitude || "";
          this.nickname = userInfo.nickname || "";
          this.qqEmail = userInfo.qqEmail || "";
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
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
      this.userId = 0;
      this.activitiesNum = 0;
      this.age = "";
      this.avatarUrl = "";
      this.gender = "";
      this.initiateNum = 0;
      this.introduction = "";
      this.latitudeLongitude = "";
      this.nickname = "";
      this.qqEmail = "";
      this.accessToken = "";
      this.refreshToken = "";

      // 清除本地存储
      uni.removeStorageSync("accessToken");
      uni.removeStorageSync("refreshToken");
      uni.removeStorageSync("userInfo");
    },

    /**
     * 检查登录状态
     * @returns 是否登录
     */
    checkLoginStatus(): boolean {
      if (!this.userId || !this.accessToken) {
        // 尝试从本地存储恢复
        this.restoreFromStorage();
      }
      return this.userId !== 0 && !!this.accessToken;
    },
    /**
     * 初始化用户状态
     */
    initUserStore() {
      // 尝试从本地存储恢复
      this.restoreFromStorage();
    },
    /**
     * 设置用户兴趣标签
     * @param tags 兴趣标签数组
     */
    setUserInterestTags(tags: InterestTag[]) {
      this.interestTags = tags;
    },
  },
});
