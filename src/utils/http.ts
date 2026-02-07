interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  header?: any;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheKey?: string;
  cancelToken?: CancelToken;
}

interface Response {
  statusCode: number;
  data: any;
  header: any;
  errMsg?: string;
  errno?: number;
}

// 错误码映射表
const ErrorCodeMap: Record<number | string, string> = {
  400: "请求参数错误",
  401: "未授权，请登录",
  403: "拒绝访问",
  404: "请求资源不存在",
  408: "请求超时",
  500: "服务器内部错误",
  501: "服务未实现",
  502: "网关错误",
  503: "服务不可用",
  504: "网关超时",
  505: "HTTP版本不受支持",
  "request:fail": "网络请求失败",
  timeout: "请求超时",
};

class CancelToken {
  private cancelFn: ((reason: string) => void) | null = null;
  public isCancelled = false;

  constructor() {
    this.promise = new Promise<string>((_, reject) => {
      this.cancelFn = (reason) => {
        this.isCancelled = true;
        reject(new Error(reason));
      };
    });
  }

  promise: Promise<string>;

  cancel(reason: string) {
    if (this.cancelFn) {
      this.cancelFn(reason);
    }
  }
}

// 缓存存储
const cacheStore = new Map<string, { data: any; timestamp: number }>();
// 缓存过期时间（默认5分钟）
const CACHE_EXPIRY = 5 * 60 * 1000;

// 环境配置
const env = import.meta.env.MODE;

// 根据环境设置 BASE_URL
const BASE_URL =
  env === "production"
    ? import.meta.env.VITE_PROD_BASE_URL || "https://api.yourdomain.com"
    : import.meta.env.VITE_BASE_URL || "http://192.168.10.9:8888";

// 获取系统信息用于 User-Agent
let systemInfo: UniApp.GetSystemInfoResult;
try {
  systemInfo = uni.getSystemInfoSync();
} catch (e) {
  systemInfo = {
    osName: "unknown",
    osVersion: "unknown",
    uniPlatform: "unknown",
    deviceBrand: "unknown",
    deviceModel: "unknown",
  } as any;
}

const userAgent = `CampusHub/${import.meta.env.VITE_APP_VERSION || "1.0.0"} (${
  systemInfo.uniPlatform
}; ${systemInfo.osName} ${systemInfo.osVersion}; ${systemInfo.deviceBrand} ${
  systemInfo.deviceModel
})`;

// 日志工具
const logger = {
  info: (msg: string, data?: any) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(`[HTTP INFO] ${msg}`, data || "");
    }
  },
  error: (msg: string, err?: any) => {
    console.error(`[HTTP ERROR] ${msg}`, err || "");
  },
};

// 请求拦截器
const requestInterceptors: Array<(config: RequestOptions) => RequestOptions> = [
  (config) => {
    // 添加 token
    const token = uni.getStorageSync("token");
    if (token) {
      config.header = {
        ...config.header,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (config) => {
    // 添加默认 header 和 User-Agent
    config.header = {
      "Content-Type": "application/json",
      "X-Client-Info": userAgent, // 自定义 UA
      // 移除 Accept-Encoding 头，因为浏览器不允许客户端脚本设置此头
      ...config.header,
    };
    return config;
  },
];

// 响应拦截器
const responseInterceptors: Array<(response: Response) => Response> = [
  (response) => {
    // 统一处理响应数据
    return response;
  },
];

// 错误拦截器
const errorInterceptors: Array<(error: any) => any> = [
  (error) => {
    logger.error("Request Error Intercepted", error);

    let errorMsg = "网络请求异常";

    // 处理 uni.request 返回的错误格式
    if (error.errMsg) {
      if (error.errMsg.includes("timeout")) {
        errorMsg = ErrorCodeMap["timeout"];
      } else if (error.errMsg.includes("request:fail")) {
        errorMsg = ErrorCodeMap["request:fail"];
      }
    }

    // 处理 HTTP 状态码错误
    if (error.statusCode && ErrorCodeMap[error.statusCode]) {
      errorMsg = ErrorCodeMap[error.statusCode];
    }

    // 提示错误
    uni.showToast({
      title: errorMsg,
      icon: "none",
      duration: 3000,
    });

    // 处理 401 错误（token 过期）
    if (error.statusCode === 401) {
      uni.showToast({
        title: "登录过期，请重新登录",
        icon: "none",
      });
      // 清除过期 token
      uni.removeStorageSync("accessToken");
      uni.removeStorageSync("refreshToken");
      uni.removeStorageSync("token"); // 确保清除所有可能的 token key
      // 跳转到登录页
      setTimeout(() => {
        uni.navigateTo({
          url: "/pages/login/index",
        });
      }, 1000);
    }

    // 统一返回格式化的错误对象
    return {
      ...error,
      message: errorMsg,
    };
  },
];

// 应用请求拦截器
const applyRequestInterceptors = (config: RequestOptions): RequestOptions => {
  return requestInterceptors.reduce(
    (prev, interceptor) => interceptor(prev),
    config,
  );
};

// 应用响应拦截器
const applyResponseInterceptors = (response: Response): Response => {
  return responseInterceptors.reduce(
    (prev, interceptor) => interceptor(prev),
    response,
  );
};

// 应用错误拦截器
const applyErrorInterceptors = (error: any): any => {
  return errorInterceptors.reduce(
    (prev, interceptor) => interceptor(prev),
    error,
  );
};

// 检查缓存
const checkCache = (key: string): any | null => {
  const cached = cacheStore.get(key);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < CACHE_EXPIRY) {
      return cached.data;
    } else {
      // 缓存过期，删除
      cacheStore.delete(key);
    }
  }
  return null;
};

// 设置缓存
const setCache = (key: string, data: any): void => {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// 生成缓存键
const generateCacheKey = (options: RequestOptions): string => {
  if (options.cacheKey) {
    return options.cacheKey;
  }
  const { url, method = "GET", data } = options;
  const dataStr = method === "GET" ? JSON.stringify(data) : "";
  return `${url}_${method}_${dataStr}`;
};

export const http = <T>(
  options: RequestOptions,
  retryCount = 0,
): Promise<T> => {
  // 应用请求拦截器
  const config = applyRequestInterceptors(options);

  // 检查是否取消请求
  if (config.cancelToken && config.cancelToken.isCancelled) {
    return Promise.reject(new Error("Request cancelled"));
  }

  // 检查缓存
  if (config.cache && config.method === "GET") {
    const cacheKey = generateCacheKey(config);
    const cachedData = checkCache(cacheKey);
    if (cachedData) {
      logger.info(`Cache Hit: ${config.url}`);
      return Promise.resolve(cachedData as T);
    }
  }

  // 根据环境处理路径
  let requestUrl = config.url;
  // 简单判断是否已经是绝对路径
  if (!config.url.startsWith("http")) {
    // 检查是否为 H5 环境
    const isH5 =
      typeof window !== "undefined" && systemInfo.uniPlatform === "web";
    if (isH5) {
      // H5 环境使用相对路径，避免跨域
      requestUrl = config.url;
    } else {
      // 其他环境使用完整路径
      requestUrl = BASE_URL + config.url;
    }
  }

  logger.info(`Request: ${config.method || "GET"} ${requestUrl}`, config.data);

  return new Promise((resolve, reject) => {
    // 处理取消请求
    if (config.cancelToken) {
      config.cancelToken.promise.catch((reason) => {
        reject(new Error(reason));
      });
    }

    uni.request({
      url: requestUrl,
      method: config.method || "GET",
      data: config.data,
      header: config.header,
      timeout: config.timeout || 30000, // 默认 30 秒超时
      success: (res: any) => {
        // uni.request success callback arg is any in some typings
        logger.info(`Response: ${res.statusCode}`, res.data);

        // 应用响应拦截器
        const processedResponse = applyResponseInterceptors(res);

        if (
          processedResponse.statusCode >= 200 &&
          processedResponse.statusCode < 300
        ) {
          // 设置缓存
          if (config.cache && config.method === "GET") {
            const cacheKey = generateCacheKey(config);
            setCache(cacheKey, processedResponse.data);
          }
          resolve(processedResponse.data as T);
        } else {
          // 处理业务/HTTP错误
          const error = applyErrorInterceptors(processedResponse);

          // 处理重试
          if (config.retry && retryCount < config.retry) {
            const delay = (config.retryDelay || 1000) * Math.pow(2, retryCount); // 指数退避
            logger.info(
              `Retry attempt ${
                retryCount + 1
              } for ${requestUrl} after ${delay}ms`,
            );
            setTimeout(() => {
              http<T>(config, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, delay);
          } else {
            reject(error);
          }
        }
      },
      fail: (err) => {
        logger.error(`Network Fail: ${requestUrl}`, err);
        // 应用错误拦截器
        const processedError = applyErrorInterceptors(err);

        // 处理重试
        if (config.retry && retryCount < config.retry) {
          const delay = (config.retryDelay || 1000) * Math.pow(2, retryCount); // 指数退避
          logger.info(
            `Retry attempt ${retryCount + 1} for ${requestUrl} after ${delay}ms`,
          );
          setTimeout(() => {
            http<T>(config, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          reject(processedError);
        }
      },
    });
  });
};

// 取消请求工具
export const createCancelToken = () => {
  return new CancelToken();
};

// 清除缓存
export const clearCache = (key?: string) => {
  if (key) {
    cacheStore.delete(key);
  } else {
    cacheStore.clear();
  }
};

// 获取缓存大小
export const getCacheSize = () => {
  return cacheStore.size;
};

// 快捷方法
export const get = <T>(
  url: string,
  options?: Omit<RequestOptions, "url" | "method">,
): Promise<T> => {
  return http<T>({ ...options, url, method: "GET" });
};

export const post = <T>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, "url" | "method" | "data">,
): Promise<T> => {
  return http<T>({ ...options, url, method: "POST", data });
};

export const put = <T>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, "url" | "method" | "data">,
): Promise<T> => {
  return http<T>({ ...options, url, method: "PUT", data });
};

export const del = <T>(
  url: string,
  options?: Omit<RequestOptions, "url" | "method">,
): Promise<T> => {
  return http<T>({ ...options, url, method: "DELETE" });
};
