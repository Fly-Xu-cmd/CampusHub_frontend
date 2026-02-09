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
  // 新增：是否自动显示错误提示
  showErrorToast?: boolean;
  // 新增：是否在 Token 过期时自动刷新
  autoRefresh?: boolean;
}

interface Response {
  statusCode: number;
  data: any;
  header: any;
  errMsg?: string;
  errno?: number;
}

import { authApi } from "@/api/register/router";
import {
  getBusinessCodeMessage,
  shouldRedirectToLogin,
  isTokenError,
  isRetryableError,
  CodeTokenInvalid,
  CodeTokenExpired,
} from "./businessCodes";

// HTTP 状态码映射表（仅用于网络层面的错误）
const ErrorCodeMap: Record<number | string, string> = {
  400: "请求参数错误",
  401: "未授权访问", // 注意：401 现在主要由 Token 业务码处理
  403: "拒绝访问",
  404: "请求资源不存在",
  408: "请求超时",
  429: "请求过于频繁",
  500: "服务器内部错误",
  501: "服务未实现",
  502: "网关错误",
  503: "服务不可用",
  504: "网关超时",
  505: "HTTP版本不受支持",
  "request:fail": "网络请求失败，请检查网络连接",
  timeout: "请求超时，请稍后重试",
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
    const token = uni.getStorageSync("accessToken");
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

    // 处理业务错误
    if (error.message && error.message.includes("业务错误")) {
      // 业务错误已在业务码处理中显示提示，这里不再重复显示
      return {
        ...error,
        message: error.message,
      };
    }

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

    // 统一返回格式化的错误对象
    return {
      ...error,
      message: errorMsg,
    };
  },
];

// ========== 业务码处理辅助函数 ==========

/**
 * 处理 Token 错误：清除登录状态并跳转登录页
 */
function handleTokenError() {
  // 清除本地存储
  uni.removeStorageSync("accessToken");
  uni.removeStorageSync("refreshToken");
  uni.removeStorageSync("userInfo");

  // 提示用户
  uni.showToast({
    title: "登录已过期，请重新登录",
    icon: "none",
    duration: 2000,
  });

  // 延迟跳转，让用户看到提示
  setTimeout(() => {
    uni.reLaunch({
      url: "/pages/login/index",
    });
  }, 2000);
}

/**
 * 处理业务错误：显示提示或执行其他操作
 */
function handleBusinessError(
  code: number,
  message: string,
  config: RequestOptions
) {
  // 对于某些特定错误码，可以提供额外的处理逻辑
  switch (code) {
    case 2016: // 邮箱已注册
      uni.showToast({
        title: message,
        icon: "none",
        duration: 2500,
      });
      break;

    case 2008: // Token 过期
      // 已在 Token 错误处理中统一处理
      break;

    case 2205: // 认证状态不允许申请
    case 2206: // 认证状态不允许确认
      uni.showToast({
        title: message,
        icon: "none",
        duration: 2000,
      });
      break;

    case 2502: // 验证码错误
      uni.showToast({
        title: message,
        icon: "none",
        duration: 2000,
      });
      break;

    case 2301: // 文件过大
      uni.showToast({
        title: message,
        icon: "none",
        duration: 2500,
      });
      break;

    case 1005: // 请求过于频繁
      uni.showToast({
        title: message,
        icon: "none",
        duration: 2000,
      });
      break;

    default:
      // 默认处理
      const defaultDuration = 2000;
      uni.showToast({
        title: message,
        icon: "none",
        duration: defaultDuration,
      });
      break;
  }
}

// 刷新令牌管理
let refreshPromise: Promise<string> | null = null;
const attemptTokenRefresh = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;
  const refreshToken = uni.getStorageSync("refreshToken");
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }
  refreshPromise = authApi
    .refreshToken({ refreshToken })
    .then((resp: any) => {
      const newAccessToken = resp?.data?.accessToken ?? resp?.accessToken ?? "";
      if (!newAccessToken) {
        throw new Error("Failed to obtain new access token");
      }
      uni.setStorageSync("accessToken", newAccessToken);
      return newAccessToken;
    })
    .catch((err) => {
      uni.removeStorageSync("accessToken");
      uni.removeStorageSync("refreshToken");
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

// 应用请求拦截器
const applyRequestInterceptors = (config: RequestOptions): RequestOptions => {
  return requestInterceptors.reduce(
    (prev, interceptor) => interceptor(prev),
    config
  );
};

// 应用响应拦截器
const applyResponseInterceptors = (response: Response): Response => {
  return responseInterceptors.reduce(
    (prev, interceptor) => interceptor(prev),
    response
  );
};

// 应用错误拦截器
const applyErrorInterceptors = (error: any): any => {
  return errorInterceptors.reduce(
    (prev, interceptor) => interceptor(prev),
    error
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
  retryCount = 0
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

        // 优先处理 401 状态码（token 刷新）
        if (
          processedResponse.statusCode === 401 &&
          !(config as any).__isRetryAfterRefresh
        ) {
          const refreshToken = uni.getStorageSync("refreshToken");
          if (refreshToken) {
            logger.info("Access token expired (401), attempting refresh");
            attemptTokenRefresh()
              .then((newToken) => {
                const retryConfig = {
                  ...(config as any),
                  __isRetryAfterRefresh: true,
                };
                retryConfig.header = {
                  ...retryConfig.header,
                  Authorization: `Bearer ${newToken}`,
                };
                http<T>(retryConfig, retryCount)
                  .then(resolve)
                  .catch((err) => {
                    const processedErr = applyErrorInterceptors(err);
                    reject(processedErr);
                  });
              })
              .catch((refreshError) => {
                logger.error("Token refresh failed", refreshError);
                const processedErr = applyErrorInterceptors(processedResponse);
                reject(processedErr);
              });
            return;
          }
        }

        // 处理业务码错误
        if (res.data?.code !== 0) {
          const businessCode = res.data.code;
          const businessMessage = res.data.message || getBusinessCodeMessage(businessCode);
          const errorMsg = `业务错误(${businessCode}): ${businessMessage}`;

          // Token 相关错误
          if (isTokenError(businessCode)) {
            logger.info(`Token error detected: ${businessCode}, attempting refresh`);

            // 如果是 Token 错误且允许自动刷新，尝试刷新
            if ((config as any).autoRefresh !== false && !(config as any).__isRetryAfterRefresh) {
              const refreshToken = uni.getStorageSync("refreshToken");
              if (refreshToken) {
                attemptTokenRefresh()
                  .then((newToken) => {
                    const retryConfig = {
                      ...(config as any),
                      __isRetryAfterRefresh: true,
                    };
                    retryConfig.header = {
                      ...retryConfig.header,
                      Authorization: `Bearer ${newToken}`,
                    };
                    http<T>(retryConfig, retryCount)
                      .then(resolve)
                      .catch((err) => {
                        handleBusinessError(businessCode, businessMessage, config);
                        reject(new Error(errorMsg));
                      });
                  })
                  .catch(() => {
                    // Token 刷新失败，清除登录状态
                    handleTokenError();
                    handleBusinessError(businessCode, businessMessage, config);
                    reject(new Error(errorMsg));
                  });
                return;
              }
            }

            // 不自动刷新或刷新失败，清除登录状态并跳转
            handleTokenError();
          }

          // 显示错误提示（默认显示，可通过配置关闭）
          if ((config as any).showErrorToast !== false) {
            handleBusinessError(businessCode, businessMessage, config);
          }

          reject(new Error(errorMsg));
          return;
        }

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
          // 处理其他 HTTP 错误
          const error = applyErrorInterceptors(processedResponse);

          // 处理重试
          if (config.retry && retryCount < config.retry) {
            const delay = (config.retryDelay || 1000) * Math.pow(2, retryCount); // 指数退避
            logger.info(
              `Retry attempt ${
                retryCount + 1
              } for ${requestUrl} after ${delay}ms`
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
            `Retry attempt ${retryCount + 1} for ${requestUrl} after ${delay}ms`
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
  options?: Omit<RequestOptions, "url" | "method">
): Promise<T> => {
  return http<T>({ ...options, url, method: "GET" });
};

export const post = <T>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, "url" | "method" | "data">
): Promise<T> => {
  return http<T>({ ...options, url, method: "POST", data });
};

export const put = <T>(
  url: string,
  data?: any,
  options?: Omit<RequestOptions, "url" | "method" | "data">
): Promise<T> => {
  return http<T>({ ...options, url, method: "PUT", data });
};

export const del = <T>(
  url: string,
  options?: Omit<RequestOptions, "url" | "method">
): Promise<T> => {
  return http<T>({ ...options, url, method: "DELETE" });
};

/**
 * 文件上传函数（支持 multipart/form-data，可上传多个文件）
 * @param url 上传地址
 * @param formData 表单数据，包含文件路径/File对象和其他字段
 * @param fileFields 文件字段名数组，指定哪些字段是文件
 * @param options 请求选项
 */
export const upload = <T>(
  url: string,
  formData: Record<string, any>,
  fileFields: string[],
  options?: Omit<RequestOptions, "url" | "method" | "data">
): Promise<T> => {
  return new Promise((resolve, reject) => {
    // 检查是否所有文件字段都有值
    const hasAllFiles = fileFields.every(field => {
      const value = formData[field];
      return value && (typeof value === 'string' || value instanceof File);
    });

    if (!hasAllFiles) {
      reject(new Error("缺少必需的文件字段"));
      return;
    }

    // 构建 formData（非文件字段）
    const otherFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (!fileFields.includes(key) && value !== undefined && value !== null) {
        otherFields[key] = String(value);
      }
    }

    // 获取 token
    const token = uni.getStorageSync("token") || uni.getStorageSync("accessToken");

    // #ifdef H5
    // H5 环境：使用 FormData + fetch
    const formDataObj = new FormData();

    // 添加普通字段
    Object.entries(otherFields).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    // 辅助函数：将文件路径转换为 File
    const convertPathToFile = async (filePath: string, fieldName: string): Promise<void> => {
      try {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const fileName = filePath.split('/').pop() || `image_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        formDataObj.append(fieldName, file);
      } catch (e) {
        console.error(`转换文件失败: ${fieldName}`, e);
        throw new Error(`文件 ${fieldName} 转换失败`);
      }
    };

    // 处理文件字段
    const filePromises = fileFields.map(field => {
      const value = formData[field];
      if (value instanceof File) {
        // 直接是 File 对象
        formDataObj.append(field, value);
        return Promise.resolve();
      } else if (typeof value === 'string') {
        // 是文件路径，需要转换
        return convertPathToFile(value, field);
      }
      return Promise.resolve();
    });

    // 所有文件处理完成后发送请求
    Promise.all(filePromises)
      .then(() => {
        return fetch(BASE_URL + url, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
          },
          body: formDataObj,
        });
      })
      .then(response => response.json())
      .then(result => {
        if (result.code === 0) {
          resolve({ data: result } as T);
        } else {
          const businessMessage = getBusinessCodeMessage(result.code)
            || result.message
            || "上传失败";
          if (options?.showErrorToast !== false) {
            uni.showToast({ title: businessMessage, icon: "none", duration: 2000 });
          }
          reject(new Error(`业务错误(${result.code}): ${businessMessage}`));
        }
      })
      .catch(err => {
        const errorMessage = ErrorCodeMap[err.message] || err.message || "上传失败";
        if (options?.showErrorToast !== false) {
          uni.showToast({ title: errorMessage, icon: "none", duration: 2000 });
        }
        reject(new Error(errorMessage));
      });
    // #endif

    // #ifndef H5
    // 非H5环境（小程序/App）：使用 uni.uploadFile
    // 构建文件列表
    interface UploadFileItem {
      name: string;
      uri: string;
    }
    const files: UploadFileItem[] = [];

    for (const field of fileFields) {
      const value = formData[field];
      if (value) {
        files.push({
          name: field,
          uri: value,
        });
      }
    }

    if (files.length === 0) {
      reject(new Error("没有找到要上传的文件"));
      return;
    }

    uni.uploadFile({
      url: BASE_URL + url,
      files: files,
      formData: otherFields,
      header: {
        Authorization: token ? `Bearer ${token}` : "",
        ...(options?.header || {}),
      },
      timeout: options?.timeout || 30000,
      success: (res) => {
        // uni.uploadFile 的 res.data 是字符串类型，需要解析
        let responseData: any;
        try {
          responseData = typeof res.data === "string"
            ? JSON.parse(res.data)
            : res.data;
        } catch (e) {
          responseData = res.data;
        }

        // 构造标准响应格式
        const processedResponse: Response = {
          statusCode: res.statusCode,
          data: responseData,
          header: (res as any).header || {},
          errMsg: res.errMsg,
        };

        // 业务码处理
        if (responseData && typeof responseData === "object") {
          if (responseData.code === 0) {
            // 成功
            resolve(processedResponse as T);
          } else {
            // 业务错误
            const businessMessage = getBusinessCodeMessage(responseData.code)
              || responseData.message
              || "请求失败";

            // 显示错误提示（除非禁用）
            if (options?.showErrorToast !== false) {
              uni.showToast({
                title: businessMessage,
                icon: "none",
                duration: responseData.code === 2016 ||
                         responseData.code === 2301 ||
                         responseData.code === 2105
                  ? 2500
                  : 2000,
              });
            }

            // Token 错误处理
            if (isTokenError(responseData.code)) {
              if (options?.autoRefresh !== false) {
                attemptTokenRefresh()
                  .then(() => {
                    // Token 刷新成功，重新上传
                    upload<T>(url, formData, fileFields, options).then(resolve).catch(reject);
                  })
                  .catch((error) => {
                    console.error("Token 刷新失败:", error);
                    reject(new Error(`业务错误(${responseData.code}): ${businessMessage}`));
                  });
                return;
              }
            }

            reject(new Error(`业务错误(${responseData.code}): ${businessMessage}`));
          }
        } else {
          resolve(processedResponse as T);
        }
      },
      fail: (err) => {
        // 网络错误处理
        const errorMessage = ErrorCodeMap[err.errMsg] || err.errMsg || "网络请求失败";

        if (options?.showErrorToast !== false) {
          uni.showToast({
            title: errorMessage,
            icon: "none",
            duration: 2000,
          });
        }

        reject(new Error(errorMessage));
      },
    });
    // #endif
  });
};
