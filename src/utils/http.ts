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
}

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
const env = process.env.NODE_ENV;

// 根据环境设置 BASE_URL
const BASE_URL =
  env === "production"
    ? "https://api.yourdomain.com"
    : "https://dev-api.yourdomain.com";

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
    // 添加默认 header
    config.header = {
      "Content-Type": "application/json",
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
    // 处理网络错误
    if (error.errMsg && error.errMsg.includes("timeout")) {
      uni.showToast({
        title: "网络请求超时",
        icon: "none",
      });
    } else if (error.errMsg && error.errMsg.includes("network")) {
      uni.showToast({
        title: "网络连接失败",
        icon: "none",
      });
    }
    return error;
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
      return Promise.resolve(cachedData as T);
    }
  }

  // SSR 环境下处理完整路径
  let requestUrl = config.url;
  if (typeof window === "undefined") {
    requestUrl = config.url.startsWith("http")
      ? config.url
      : BASE_URL + config.url;
  } else {
    // 浏览器环境下处理路径
    requestUrl = config.url.startsWith("http")
      ? config.url
      : BASE_URL + config.url;
  }

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
      success: (res) => {
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
          // 处理错误
          const error = applyErrorInterceptors(processedResponse);

          // 处理重试
          if (config.retry && retryCount < config.retry) {
            const delay = config.retryDelay || 1000;
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
        // 应用错误拦截器
        const processedError = applyErrorInterceptors(err);

        // 处理重试
        if (config.retry && retryCount < config.retry) {
          const delay = config.retryDelay || 1000;
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
