import { defineStore } from "pinia";
import type { InterestTag, UserInfo } from "@/types/modules/user";
import { initWebSocket, destroyWebSocket } from "@/utils/websocket";

export const useUserStore = defineStore("user", {
  state: (): UserInfo => ({
    userId: 0,
    activitiesNum: 0,
    age: "",
    avatarUrl: "",
    avatarId: 0,
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
    credit: 0,
    isStudentVerified: false,
    unReadSystemMessage: 0,
  }),

  getters: {
    userInfo(): Partial<UserInfo> {
      return {
        userId: this.userId,
        activitiesNum: this.activitiesNum,
        age: this.age,
        avatarUrl: this.avatarUrl,
        avatarId: this.avatarId,
        gender: this.gender,
        initiateNum: this.initiateNum,
        introduction: this.introduction,
        latitudeLongitude: this.latitudeLongitude,
        nickname: this.nickname,
        qqEmail: this.qqEmail,
        interestTags: this.interestTags,
        credit: this.credit,
        isStudentVerified: this.isStudentVerified,
        unReadSystemMessage: this.unReadSystemMessage,
      };
    },

    isAuthenticated(): boolean {
      return this.userId !== 0;
    },

    hasAvatar(): boolean {
      return !!this.avatarUrl;
    },

    hasUnReadSystemMessage(): boolean {
      return this.unReadSystemMessage > 0;
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
      refreshToken: string,
    ) {
      console.log("login", userData, accessToken, refreshToken);
      this.updateUserInfo(userData);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      if (userData.interestTags) {
        this.setUserInterestTags(userData.interestTags);
      }

      // 存储 token 到本地（仅在客户端）
      // #ifdef H5
      if (!import.meta.env.SSR) {
        uni.setStorageSync("accessToken", accessToken);
        uni.setStorageSync("refreshToken", refreshToken);

        // 存储用户信息到本地
        uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
      }
      // #endif

      // #ifndef H5
      // 非 H5 平台（小程序等）：直接执行存储
      uni.setStorageSync("accessToken", accessToken);
      uni.setStorageSync("refreshToken", refreshToken);

      // 存储用户信息到本地
      uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
      // #endif

      // 登录成功后初始化 WebSocket 连接（仅在客户端）
      // #ifdef H5
      if (!import.meta.env.SSR) {
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://192.168.10.9/ws";
        initWebSocket({
          url: wsUrl,
          token: accessToken,
        });
        console.log("[UserStore] WebSocket 连接已初始化");
      }
      // #endif

      // #ifndef H5
      // 非 H5 平台（小程序等）：直接执行 WebSocket 初始化
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://192.168.10.9/ws";
      initWebSocket({
        url: wsUrl,
        token: accessToken,
      });
      console.log("[UserStore] WebSocket 连接已初始化");
      // #endif
    },

    /**
     * 登出
     */
    logout() {
      // 断开 WebSocket 连接（仅在客户端）
      // #ifdef H5
      if (!import.meta.env.SSR) {
        destroyWebSocket();
        console.log("[UserStore] WebSocket 连接已断开");

        // 清除未读消息本地存储
        uni.removeStorageSync("group_unread_messages");
      }
      // #endif

      // #ifndef H5
      // 非 H5 平台（小程序等）：直接执行
      destroyWebSocket();
      console.log("[UserStore] WebSocket 连接已断开");

      // 清除未读消息本地存储
      uni.removeStorageSync("group_unread_messages");
      // #endif

      // 重置状态
      this.userId = 0;
      this.activitiesNum = 0;
      this.age = "";
      this.avatarUrl = "";
      this.avatarId = 0;
      this.gender = "";
      this.initiateNum = 0;
      this.introduction = "";
      this.latitudeLongitude = "";
      this.nickname = "";
      this.qqEmail = "";
      this.credit = 0;
      this.isStudentVerified = false;
      this.refreshToken = "";
      this.accessToken = "";

      // 清除本地存储（仅在客户端）
      // #ifdef H5
      if (!import.meta.env.SSR) {
        uni.removeStorageSync("accessToken");
        uni.removeStorageSync("refreshToken");
        uni.removeStorageSync("userInfo");
      }
      // #endif

      // #ifndef H5
      // 非 H5 平台（小程序等）：直接执行
      uni.removeStorageSync("accessToken");
      uni.removeStorageSync("refreshToken");
      uni.removeStorageSync("userInfo");
      // #endif
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
      this.avatarId = userData.avatarId || this.avatarId;
      this.gender = userData.gender || this.gender;
      this.initiateNum = userData.initiateNum || this.initiateNum;
      this.introduction = userData.introduction || this.introduction;
      this.latitudeLongitude =
        userData.latitudeLongitude || this.latitudeLongitude;
      this.nickname = userData.nickname || this.nickname;
      this.qqEmail = userData.qqEmail || this.qqEmail;
      this.interestTags = userData.interestTags || this.interestTags;
      this.credit = userData.credit || this.credit;
      this.isStudentVerified =
        userData.isStudentVerified || this.isStudentVerified;
      //触发getter更新
      this.userInfo;

      // 更新本地存储（仅在客户端）
      // #ifdef H5
      if (!import.meta.env.SSR) {
        uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
      }
      // #endif

      // #ifndef H5
      // 非 H5 平台（小程序等）：直接执行
      uni.setStorageSync("userInfo", JSON.stringify(this.userInfo));
      // #endif
    },

    /**
     * 从本地存储恢复用户状态
     * 注意：此方法仅在客户端环境执行，SSR 时会跳过
     */
    restoreFromStorage() {
      // #ifdef H5
      if (import.meta.env.SSR) {
        console.log("SSR 模式：跳过从本地存储恢复用户状态");
        return;
      }
      // #endif

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
          this.avatarId = userInfo.avatarId || 0;
          this.gender = userInfo.gender || "";
          this.initiateNum = userInfo.initiateNum || 0;
          this.introduction = userInfo.introduction || "";
          this.latitudeLongitude = userInfo.latitudeLongitude || "";
          this.nickname = userInfo.nickname || "";
          this.qqEmail = userInfo.qqEmail || "";
          this.credit = userInfo.credit || 0;
          this.isStudentVerified = userInfo.isStudentVerified || false;
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;

          // 恢复登录状态后，初始化 WebSocket 连接
          const wsUrl = import.meta.env.VITE_WS_URL || "ws://192.168.10.9/ws";
          initWebSocket({
            url: wsUrl,
            token: accessToken,
          });
          console.log("[UserStore] 已从本地存储恢复，WebSocket 连接已初始化");
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
      this.avatarId = 0;
      this.gender = "";
      this.initiateNum = 0;
      this.introduction = "";
      this.latitudeLongitude = "";
      this.nickname = "";
      this.qqEmail = "";
      this.credit = 0;
      this.isStudentVerified = false;
      this.accessToken = "";
      this.refreshToken = "";

      // 清除本地存储
      // #ifdef H5
      if (!import.meta.env.SSR) {
        uni.removeStorageSync("accessToken");
        uni.removeStorageSync("refreshToken");
        uni.removeStorageSync("userInfo");
      }
      // #endif

      // #ifndef H5
      // 非 H5 平台（小程序等）：直接执行
      uni.removeStorageSync("accessToken");
      uni.removeStorageSync("refreshToken");
      uni.removeStorageSync("userInfo");
      // #endif
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
