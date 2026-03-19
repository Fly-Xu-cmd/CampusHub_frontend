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

import {
  getBusinessCodeMessage,
  shouldRedirectToLogin,
  isTokenError,
  isRetryableError,
  isRefreshTokenError,
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

// 根据环境设置 BASE_URL（后端 API 地址）
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://8.136.112.63:3030";

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
  config: RequestOptions,
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

  // 直接使用 post 调用刷新接口，避免循环依赖
  refreshPromise = post<{ data: { accessToken: string } }>(
    "/api/v1/refresh_token",
    { refreshToken },
    { showErrorToast: false, autoRefresh: false } // 禁止自动刷新和错误提示
  )
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
                    // 刷新 token 后仍然失败（可能是 401 或其他错误）
                    // 作为兜底，执行重新登录
                    logger.error("Retry after token refresh failed", err);
                    handleTokenError();
                    const processedErr = applyErrorInterceptors(err);
                    reject(processedErr);
                  });
              })
              .catch((refreshError) => {
                // 刷新 token 失败，作为兜底，执行重新登录
                logger.error("Token refresh failed", refreshError);
                handleTokenError();
                const processedErr = applyErrorInterceptors(processedResponse);
                reject(processedErr);
              });
            return;
          }
        }

        // 处理业务码错误
        if (res.data?.code !== 0) {
          const businessCode = res.data.code;
          const businessMessage =
            res.data.message || getBusinessCodeMessage(businessCode);
          const errorMsg = `业务错误(${businessCode}): ${businessMessage}`;

          // Token 相关错误
          if (isTokenError(businessCode)) {
            // 如果是刷新 Token 无效错误（2055/2056），直接清除登录状态
            if (isRefreshTokenError(businessCode)) {
              logger.info(
                `Refresh token error detected: ${businessCode}, clearing login state`,
              );
              handleTokenError();
              handleBusinessError(businessCode, businessMessage, config);
              reject(new Error(errorMsg));
              return;
            }

            // 其他 Token 错误（2002/2003），尝试刷新
            logger.info(
              `Token error detected: ${businessCode}, attempting refresh`,
            );

            // 如果是 Token 错误且允许自动刷新，尝试刷新
            if (
              (config as any).autoRefresh !== false &&
              !(config as any).__isRetryAfterRefresh
            ) {
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
                        // 刷新 token 后重试仍然失败，作为兜底执行重新登录
                        logger.error("Retry after token refresh failed in business code", err);
                        handleTokenError();
                        handleBusinessError(
                          businessCode,
                          businessMessage,
                          config,
                        );
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

/**
 * 文件上传函数（支持 multipart/form-data，可上传多个文件）
 * @param url 上传地址
 * @param formData 表单数据，包含文件路径/File对象和其他字段
 * @param options 请求选项
 * @description
 * 自动识别文件字段：
 * - string 类型的本地文件路径（包含路径分隔符 / 或 \）
 * - File、Blob 对象
 * - 其他值作为普通表单字段（数组会自动序列化为 JSON 字符串）
 */
export const upload = async <T>(
  url: string,
  formData: Record<string, any>,
  options?: Omit<RequestOptions, "url" | "method" | "data">,
): Promise<T> => {
  // 自动识别文件字段
  const identifyFileFields = (
    data: Record<string, any>,
  ): { fileFields: string[]; otherFields: Record<string, any> } => {
    const fileFields: string[] = [];
    const otherFields: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) {
        continue;
      }

      // 判断是否为文件字段
      const isFile =
        // File 或 Blob 对象
        value instanceof File ||
        value instanceof Blob ||
        // 字符串类型的本地文件路径或 blob URL
        (typeof value === "string" &&
          (
            // blob URL（H5 环境 uni.chooseImage 返回的格式）
            value.startsWith("blob:") ||
            // 本地文件路径（包含路径分隔符，且不是外部 URL）
            (
              (value.includes("/") || value.includes("\\")) &&
              !value.startsWith("http://") &&
              !value.startsWith("https://") &&
              !value.startsWith("data:")
            )
          ));

      if (isFile) {
        fileFields.push(key);
      } else {
        // 普通字段
        if (Array.isArray(value)) {
          otherFields[key] = JSON.stringify(value);
        } else if (typeof value === "object") {
          otherFields[key] = JSON.stringify(value);
        } else {
          otherFields[key] = String(value);
        }
      }
    }

    return { fileFields, otherFields };
  };

  const { fileFields, otherFields } = identifyFileFields(formData);

  // 验证是否至少有一个文件
  if (fileFields.length === 0) {
    throw new Error("未找到要上传的文件");
  }

  // 应用请求拦截器获取配置
  const config = applyRequestInterceptors({
    ...options,
    url,
    method: "POST",
  });

  // 处理 URL（复用 http 方法的逻辑）
  let requestUrl = url;
  if (!url.startsWith("http")) {
    const isH5 =
      typeof window !== "undefined" && systemInfo.uniPlatform === "web";
    if (!isH5) {
      requestUrl = BASE_URL + url;
    }
  }

  logger.info(`Upload: POST ${requestUrl}`, {
    fileFields,
    otherFields,
  });

  // #ifdef H5
  // H5 环境：使用 FormData + fetch
  const formDataObj = new FormData();

  // 添加普通字段
  Object.entries(otherFields).forEach(([key, value]) => {
    formDataObj.append(key, value);
  });

  // 辅助函数：将文件路径转换为 File
  const convertPathToFile = async (
    filePath: string,
    fieldName: string,
  ): Promise<void> => {
    try {
      const response = await fetch(filePath);
      const blob = await response.blob();
      // 从路径中提取文件名，或生成默认文件名
      const fileName =
        filePath.split("/").pop()?.split("\\").pop() ||
        `file_${Date.now()}.bin`;
      const file = new File([blob], fileName, { type: blob.type || "" });
      formDataObj.append(fieldName, file);
    } catch (e) {
      logger.error(`文件转换失败: ${fieldName}`, e);
      throw new Error(`文件 ${fieldName} 读取失败`);
    }
  };

  // 处理文件字段
  const filePromises = fileFields.map((field) => {
    const value = formData[field];
    if (value instanceof File || value instanceof Blob) {
      // 直接是 File/Blob 对象
      formDataObj.append(field, value);
      return Promise.resolve();
    } else if (typeof value === "string") {
      // 是文件路径，需要转换
      return convertPathToFile(value, field);
    }
    return Promise.resolve();
  });

  try {
    // 所有文件处理完成后发送请求
    await Promise.all(filePromises);

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: config.header?.Authorization || "",
        "X-Client-Info": config.header?.["X-Client-Info"] || userAgent,
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
      },
      body: formDataObj,
    });

    const result = await response.json();
    logger.info(`Upload Response:`, result);

    // 业务码处理（复用 http 方法的逻辑）
    if (result.code !== 0) {
      const businessCode = result.code;
      const businessMessage =
        result.message || getBusinessCodeMessage(businessCode);

      // Token 错误处理
      if (isTokenError(businessCode)) {
        if (isRefreshTokenError(businessCode)) {
          handleTokenError();
          handleBusinessError(businessCode, businessMessage, config);
          throw new Error(`业务错误(${businessCode}): ${businessMessage}`);
        }

        // 尝试刷新 Token
        if (options?.autoRefresh !== false) {
          try {
            await attemptTokenRefresh();
            // Token 已刷新并保存到 storage，重新上传
            return upload<T>(url, formData, options);
          } catch (refreshErr) {
            // 刷新 token 失败，作为兜底执行重新登录
            logger.error("H5 upload: token refresh failed", refreshErr);
            handleTokenError();
            throw new Error(`业务错误(${businessCode}): ${businessMessage}`);
          }
        }

        handleTokenError();
      }

      // 显示错误提示
      if (options?.showErrorToast !== false) {
        handleBusinessError(businessCode, businessMessage, config);
      }

      throw new Error(`业务错误(${businessCode}): ${businessMessage}`);
    }

    // 成功返回
    return { data: result } as T;
  } catch (err: any) {
    // 网络错误处理
    const errorMessage = err.message || "上传失败";
    if (options?.showErrorToast !== false) {
      uni.showToast({
        title: errorMessage,
        icon: "none",
        duration: 2000,
      });
    }
    throw err;
  }
  // #endif

  // #ifndef H5
  // 非H5环境（小程序/App）：使用 uni.uploadFile
  interface UploadFileItem {
    name: string;
    uri: string;
  }

  const files: UploadFileItem[] = fileFields.map((field) => ({
    name: field,
    uri: formData[field],
  }));

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: requestUrl,
      files: files,
      formData: otherFields,
      header: {
        Authorization: config.header?.Authorization || "",
        "X-Client-Info": config.header?.["X-Client-Info"] || userAgent,
        ...(options?.header || {}),
      },
      timeout: options?.timeout || 30000,
      success: (res) => {
        // 解析响应数据
        let responseData: any;
        try {
          responseData =
            typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        } catch (e) {
          responseData = res.data;
        }

        logger.info(`Upload Response:`, responseData);

        // 业务码处理（复用 http 方法的逻辑）
        if (responseData && typeof responseData === "object") {
          if (responseData.code === 0) {
            // 成功返回
            resolve({ data: responseData } as T);
          } else {
            // 业务错误
            const businessCode = responseData.code;
            const businessMessage =
              responseData.message ||
              getBusinessCodeMessage(businessCode);

            // Token 错误处理
            if (isTokenError(businessCode)) {
              if (isRefreshTokenError(businessCode)) {
                handleTokenError();
                handleBusinessError(businessCode, businessMessage, config);
                reject(
                  new Error(`业务错误(${businessCode}): ${businessMessage}`),
                );
                return;
              }

              // 尝试刷新 Token
              if (options?.autoRefresh !== false) {
                attemptTokenRefresh()
                  .then(() => {
                    // Token 刷新成功，重新上传
                    upload<T>(url, formData, options).then(resolve).catch((err) => {
                      // 刷新 token 后重试仍然失败，作为兜底执行重新登录
                      logger.error("Upload retry after token refresh failed", err);
                      handleTokenError();
                      reject(
                        new Error(`业务错误(${businessCode}): ${businessMessage}`),
                      );
                    });
                  })
                  .catch(() => {
                    handleTokenError();
                    reject(
                      new Error(`业务错误(${businessCode}): ${businessMessage}`),
                    );
                  });
                return;
              }
            }

            // 显示错误提示
            if (options?.showErrorToast !== false) {
              handleBusinessError(businessCode, businessMessage, config);
            }

            reject(new Error(`业务错误(${businessCode}): ${businessMessage}`));
          }
        } else {
          // 响应格式不是标准对象，直接返回
          resolve({ data: responseData } as T);
        }
      },
      fail: (err) => {
        logger.error(`Upload Fail: ${requestUrl}`, err);
        // 网络错误处理
        const errorMessage =
          ErrorCodeMap[err.errMsg] || err.errMsg || "网络请求失败";

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
  });
  // #endif
};
