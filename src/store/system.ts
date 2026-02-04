import { defineStore } from "pinia";
import type { SystemState } from "@/types/modules/system";

export const useSystemStore = defineStore("system", {
  // 1. 补全 State 初始值
  state: (): SystemState => ({
    statusBarHeight: 0,
    navBarHeight: 44, // H5 默认
    customBarHeight: 0,
    menuButtonInfo: null,
    safeAreaInsetsBottom: 0, // 【新增】默认 0
    windowWidth: 375, // 【新增】默认 375
    capsuleWidth: 87, // 默认胶囊宽度 (微信默认约87px)
    capsuleRight: 7, // 默认胶囊右边距
  }),

  getters: {
    navBarHeightStyle: (state) => `${state.navBarHeight}px`,
    // 【新增】方便获取底部安全区样式，如果没有安全区则不留白
    safeAreaBottomStyle: (state) => `${state.safeAreaInsetsBottom}px`,
  },

  actions: {
    initSystemInfo() {
      try {
        // 1. 获取系统窗口信息
        // 注意：uni.getWindowInfo() 是新版 API，但在部分老版本基础库可能不支持，
        // 如果遇到兼容问题，可回退使用 uni.getSystemInfoSync()
        const windowInfo = uni.getWindowInfo();

        this.statusBarHeight = windowInfo.statusBarHeight || 0;
        this.windowWidth = windowInfo.windowWidth || 375;

        // 【核心补充】获取底部安全区域高度
        // iOS 全面屏通常是 34px，安卓通常是 0
        this.safeAreaInsetsBottom = windowInfo.safeAreaInsets?.bottom || 0;

        // 2. 处理微信小程序特有逻辑 (胶囊对齐)
        // #ifdef MP-WEIXIN
        const menuButton = uni.getMenuButtonBoundingClientRect();
        this.menuButtonInfo = menuButton;
        this.capsuleWidth = menuButton.width;
        this.capsuleRight = this.windowWidth - menuButton.right; // 计算右侧间距
        // 计算公式：(胶囊顶部 - 状态栏高度) * 2 + 胶囊高度
        const gap = menuButton.top - this.statusBarHeight;
        this.navBarHeight = gap * 2 + menuButton.height;

        // 防御性代码：防止极端情况算出负数
        if (!this.navBarHeight || this.navBarHeight < 0) {
          this.navBarHeight = 44;
        }
        // #endif

        // 3. 处理 H5 逻辑
        // #ifdef H5
        this.navBarHeight = 44;
        this.statusBarHeight = 20; // 【新增】H5 默认状态栏高度（当作top padding）
        // H5 端如果是在普通浏览器，safeAreaInsetsBottom 可能是 0
        // 但如果是在 Safari PWA 模式下，可能需要读取 env(safe-area-inset-bottom)
        // 这里暂时保持 API 读取的值，通常足够使用
        // #endif

        // 4. 计算总高度 (状态栏 + 导航栏)
        this.customBarHeight = this.statusBarHeight + this.navBarHeight;

        console.log("✅ 系统布局初始化:", {
          status: this.statusBarHeight,
          nav: this.navBarHeight,
          safeBottom: this.safeAreaInsetsBottom,
          total: this.customBarHeight,
        });
      } catch (e) {
        console.error("❌ 系统信息获取失败:", e);
        // 降级保底数据
        this.statusBarHeight = 20;
        this.navBarHeight = 44;
        this.customBarHeight = 64;
      }
    },
  },
});
