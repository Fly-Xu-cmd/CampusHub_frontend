/**
 * 平台判断工具
 * 用于判断当前运行环境，支持不同平台的适配
 */

// 声明 wx 对象类型
declare const wx: any;

export const platform = {
  /**
   * 是否为微信小程序
   */
  isWeixinMiniProgram(): boolean {
    // #ifdef MP-WEIXIN
    return true;
    // #endif
    // #ifndef MP-WEIXIN
    return false;
    // #endif
  },

  /**
   * 是否为小程序（包括各种小程序）
   */
  isMiniProgram(): boolean {
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return true;
    // #endif
    // #ifndef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    return false;
    // #endif
  },

  /**
   * 是否为 H5
   */
  isH5(): boolean {
    // #ifdef H5
    return true;
    // #endif
    // #ifndef H5
    return false;
    // #endif
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
