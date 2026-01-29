/**
 * 平台判断工具
 * 用于判断当前运行环境，支持不同平台的适配
 */

// 声明 wx 对象类型
declare const wx: any;

export const platform = {
  /**
   * 是否为小程序
   */
  isMiniProgram(): boolean {
    return typeof wx !== 'undefined' && wx.getSystemInfoSync;
  },

  /**
   * 是否为微信小程序
   */
  isWeixinMiniProgram(): boolean {
    return this.isMiniProgram() && (wx as any).__wxConfig?.appId;
  },

  /**
   * 是否为 H5
   */
  isH5(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },

  /**
   * 是否为移动设备
   */
  isMobile(): boolean {
    if (this.isH5()) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    // 小程序环境
    const systemInfo = uni.getSystemInfoSync();
    return systemInfo.platform === 'android' || systemInfo.platform === 'ios';
  },

  /**
   * 是否为电脑端
   */
  isDesktop(): boolean {
    if (this.isH5()) {
      return !this.isMobile();
    }
    // 小程序环境默认为移动设备
    return false;
  },

  /**
   * 获取当前平台类型
   */
  getPlatformType(): string {
    if (this.isWeixinMiniProgram()) {
      return 'mp-weixin';
    }
    if (this.isMiniProgram()) {
      return 'mini-program';
    }
    if (this.isH5()) {
      return this.isMobile() ? 'h5-mobile' : 'h5-desktop';
    }
    return 'unknown';
  }
};
