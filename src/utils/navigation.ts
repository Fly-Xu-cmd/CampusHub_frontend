/**
 * 统一的导航工具函数
 * 解决 H5 刷新后页面栈为空导致 navigateBack 失效的问题
 */

interface SafeNavigateBackOptions {
  fallbackUrl: string;
  delta?: number;
  useReLaunch?: boolean; // 是否使用 reLaunch 而不是 redirectTo
}

/**
 * 安全的返回导航
 * @param options 配置选项
 */
export const safeNavigateBack = (options: string | SafeNavigateBackOptions) => {
  // 兼容旧的调用方式：safeNavigateBack(url, delta)
  let fallbackUrl: string;
  let delta = 1;
  let useReLaunch = false;

  if (typeof options === "string") {
    fallbackUrl = options;
  } else {
    fallbackUrl = options.fallbackUrl;
    delta = options.delta ?? 1;
    useReLaunch = options.useReLaunch ?? false;
  }

  const pages = getCurrentPages();
  const pageCount = pages?.length || 0;

  if (pageCount > 1) {
    // 页面栈有多个页面，正常返回
    uni.navigateBack({ delta });
  } else {
    // 刷新后或页面栈为空时，使用 fallbackUrl
    if (useReLaunch) {
      uni.reLaunch({ url: fallbackUrl });
    } else {
      uni.redirectTo({ url: fallbackUrl });
    }
  }
};

/**
 * 获取当前页面栈信息（用于调试）
 */
export const getPageStackInfo = () => {
  const pages = getCurrentPages();
  return {
    count: pages?.length || 0,
    currentPage: pages?.[pages?.length - 1]?.route || "unknown",
    pages: pages?.map((p) => p.route) || [],
  };
};
