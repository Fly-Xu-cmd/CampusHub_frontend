/**
 * 业务错误码定义
 * 与后端 codes.go 保持一致
 *
 * 错误码规范：
 * 0       - 成功
 * 1xxx    - 通用错误
 * 2xxx    - 用户服务错误
 * 3xxx    - 活动服务错误
 * 4xxx    - 聊天服务错误
 */

// ============ 通用错误 (1xxx) ============
export const CodeSuccess = 0; // 成功
export const CodeInternalError = 1000; // 内部服务器错误
export const CodeInvalidParams = 1001; // 参数校验失败
export const CodeUnauthorized = 1002; // 未授权访问
export const CodeForbidden = 1003; // 禁止访问
export const CodeNotFound = 1004; // 资源不存在
export const CodeTooManyRequests = 1005; // 请求过于频繁
export const CodeServiceUnavailable = 1006; // 服务暂不可用
export const CodeTimeout = 1007; // 请求超时
export const CodeDBError = 1008; // 数据库错误
export const CodeCacheError = 1009; // 缓存错误
export const CodeRPCError = 1010; // RPC调用失败

// ============ 用户服务 - 认证 (2001-2010) ============
export const CodeLoginRequired = 2001; // 需要登录
export const CodeTokenInvalid = 2002; // Token无效
export const CodeTokenExpired = 2003; // Token已过期

// ============ 用户服务 - 基础业务 (2011-2050) ============
export const CodeUserNotFound = 2011; // 用户不存在
export const CodeUserDisabled = 2012; // 账号已被禁用
export const CodeUserDeleteFailed = 2013; // 用户注销失败
export const CodeUserUpdateFailed = 2014; // 用户信息更新失败
export const CodeUserRegisterFailed = 2015; // 用户注册失败
export const CodeUserEmailAlreadyExists = 2016; // 该邮箱已注册
export const CodeLoginFailed = 2017; // 账号或密码错误

// ============ 用户服务 - 密码与Token (2051-2080) ============
export const CodePasswordInvalid = 2051; // 密码格式不正确
export const CodePasswordIncorrect = 2052; // 原密码错误
export const CodePasswordUpdateFailed = 2053; // 密码修改失败
export const CodeTokenGenerateFailed = 2054; // 令牌生成失败
export const CodeRefreshTokenInvalid = 2055; // 无效的刷新令牌
export const CodeRefreshTokenExpired = 2056; // 刷新令牌已过期或不存在

// ============ 用户服务 - 信用分 (2101-2120) ============
export const CodeCreditNotFound = 2101; // 信用记录不存在
export const CodeCreditAlreadyInit = 2102; // 信用分已初始化
export const CodeCreditBlacklist = 2103; // 用户在黑名单中
export const CodeCreditRiskLimit = 2104; // 风险用户已达每日限制
export const CodeCreditCannotPublish = 2105; // 信用分不足，无法发布
export const CodeCreditSourceDup = 2106; // 信用变更来源重复
export const CodeCreditInvalidChange = 2107; // 无效的信用变更类型

// ============ 用户服务 - 学生认证 (2201-2230) ============
export const CodeVerifyNotFound = 2201; // 认证记录不存在
export const CodeVerifyAlreadyExist = 2202; // 认证记录已存在
export const CodeVerifyNotVerified = 2203; // 用户未通过学生认证
export const CodeVerifyStudentIDUsed = 2204; // 学号已被其他用户认证
export const CodeVerifyCannotApply = 2205; // 当前状态不允许申请
export const CodeVerifyCannotConfirm = 2206; // 当前状态不允许确认
export const CodeVerifyCannotCancel = 2207; // 当前状态不允许取消
export const CodeVerifyRateLimit = 2208; // 申请过于频繁
export const CodeVerifyInvalidTransit = 2209; // 无效的状态转换
export const CodeVerifyPermissionDeny = 2210; // 无权操作此认证记录
export const CodeVerifyRejectCooldown = 2211; // 拒绝后冷却期内，暂不能申请

// ============ 用户服务 - OCR识别 (2231-2250) ============
export const CodeOcrNetworkTimeout = 2231; // OCR服务网络超时
export const CodeOcrImageInvalid = 2232; // 图片无效或无法识别
export const CodeOcrRecognizeFailed = 2233; // OCR识别失败
export const CodeOcrServiceUnavailable = 2234; // OCR服务不可用
export const CodeOcrInsufficientBalance = 2235; // OCR服务余额不足
export const CodeOcrEmptyResult = 2236; // OCR识别结果为空
export const CodeOcrConfigInvalid = 2237; // OCR配置无效

// ============ 用户服务 - 文件服务 (2301-2350) ============
export const CodeFileTooLarge = 2301; // 文件超过大小限制
export const CodeFileTypeInvalid = 2302; // 文件类型不支持
export const CodeFileUploadFailed = 2303; // 文件上传失败
export const CodeFileDeleteFailed = 2304; // 文件删除失败
export const CodeFileConfigError = 2305; // 文件服务配置错误

// ============ 用户服务 - 标签业务 (2401-2420) ============
export const CodeUserTagUpdateFailed = 2401; // 用户标签更新失败

// ============ 用户服务 - 验证码与消息 (2501-2550) ============
export const CodeCaptchaNotFound = 2501; // 验证码不存在或已过期
export const CodeCaptchaError = 2502; // 验证码错误
export const CodeCaptchaTooManyAttempts = 2503; // 验证码错误次数过多
export const CodeCaptchaRateLimit = 2504; // 验证码发送过于频繁
export const CodeEmailSendFailed = 2505; // 邮件发送失败
export const CodeGeetestConfigError = 2506; // 极验配置错误
export const CodeGeetestVerifyFailed = 2507; // 极验验证失败

// ============ 活动服务 - 活动 (3001-3050) ============
export const CodeActivityNotFound = 3001; // 活动不存在
export const CodeActivityStatusInvalid = 3002; // 活动状态不允许此操作
export const CodeActivityTimeInvalid = 3003; // 活动时间设置无效
export const CodeActivityConcurrentUpdate = 3004; // 活动并发更新冲突
export const CodeActivityPermissionDenied = 3005; // 无权限操作此活动
export const CodeActivityHasRegistration = 3006; // 有报名记录不能删除

// ============ 活动服务 - 分类 (3101-3120) ============
export const CodeCategoryNotFound = 3101; // 分类不存在
export const CodeCategoryDisabled = 3102; // 分类已禁用

// ============ 活动服务 - 标签 (3201-3220) ============
export const CodeTagNotFound = 3201; // 标签不存在
export const CodeTagLimitExceeded = 3202; // 标签数量超过限制

// ============ 聊天服务 - 群组 (4001-4050) ============
export const CodeGroupNotFound = 4001; // 群组不存在
export const CodeGroupPermissionDenied = 4002; // 无权限操作此群组
export const CodeGroupStatusInvalid = 4003; // 群组状态不允许此操作
export const CodeGroupMemberNotFound = 4004; // 群成员不存在
export const CodeGroupMemberExists = 4005; // 用户已是群成员
export const CodeGroupFull = 4006; // 群组人数已满
export const CodeGroupOwnerCannotLeave = 4007; // 群主不能退出群组

// ============ 聊天服务 - 消息 (4051-4100) ============
export const CodeMessageNotFound = 4051; // 消息不存在
export const CodeMessageContentEmpty = 4052; // 消息内容不能为空
export const CodeMessageTypeInvalid = 4053; // 消息类型无效
export const CodeMessageTooLong = 4054; // 消息内容过长
export const CodeMessageSendFailed = 4055; // 消息发送失败
export const CodeMessageDeleteFailed = 4056; // 消息删除失败
export const CodeMessageNotInGroup = 4057; // 不在该群组中，无法发送消息

// ============ 聊天服务 - 通知 (4101-4150) ============
export const CodeNotificationNotFound = 4101; // 通知不存在
export const CodeNotificationAlreadyRead = 4102; // 通知已读
export const CodeNotificationMarkFailed = 4103; // 标记通知失败
export const CodeNotificationPermissionDeny = 4104; // 无权限操作此通知

// ============ 聊天服务 - 用户状态 (4151-4200) ============
export const CodeUserStatusNotFound = 4151; // 用户状态不存在
export const CodeUserStatusUpdateFail = 4152; // 更新用户状态失败

/**
 * 业务错误码消息映射
 */
export const BusinessCodeMessages: Record<number, string> = {
  // 通用错误
  [CodeSuccess]: "success",
  [CodeInternalError]: "内部服务器错误",
  [CodeInvalidParams]: "参数校验失败",
  [CodeUnauthorized]: "未授权访问",
  [CodeForbidden]: "禁止访问",
  [CodeNotFound]: "资源不存在",
  [CodeTooManyRequests]: "请求过于频繁，请稍后再试",
  [CodeServiceUnavailable]: "服务暂不可用",
  [CodeTimeout]: "请求超时",
  [CodeDBError]: "数据库错误",
  [CodeCacheError]: "缓存错误",
  [CodeRPCError]: "服务调用失败",

  // 用户服务 - 认证
  [CodeLoginRequired]: "请先登录",
  [CodeTokenInvalid]: "登录状态无效，请重新登录",
  [CodeTokenExpired]: "登录已过期，请重新登录",

  // 用户服务 - 基础业务
  [CodeUserNotFound]: "用户不存在",
  [CodeUserDisabled]: "账号已被禁用",
  [CodeUserDeleteFailed]: "用户注销失败，请稍后重试",
  [CodeUserUpdateFailed]: "用户信息更新失败，请稍后重试",
  [CodeUserRegisterFailed]: "用户注册失败，请稍后重试",
  [CodeUserEmailAlreadyExists]: "该邮箱已注册",
  [CodeLoginFailed]: "账号或密码错误",

  // 用户服务 - 密码与Token
  [CodePasswordInvalid]: "密码格式不正确，需要包含字母和数字",
  [CodePasswordIncorrect]: "原密码错误",
  [CodePasswordUpdateFailed]: "密码修改失败，请稍后重试",
  [CodeTokenGenerateFailed]: "令牌生成失败，请重试",
  [CodeRefreshTokenInvalid]: "无效的刷新令牌",
  [CodeRefreshTokenExpired]: "刷新令牌已过期，请重新登录",

  // 用户服务 - 信用分
  [CodeCreditNotFound]: "信用记录不存在",
  [CodeCreditAlreadyInit]: "信用分已初始化",
  [CodeCreditBlacklist]: "您的账户信用分过低，已被限制操作",
  [CodeCreditRiskLimit]: "您的信用分处于风险区间，每日仅限报名1次",
  [CodeCreditCannotPublish]: "信用分不足90分，暂时无法发布活动",
  [CodeCreditSourceDup]: "该操作已处理，请勿重复提交",
  [CodeCreditInvalidChange]: "无效的信用变更类型",

  // 用户服务 - 学生认证
  [CodeVerifyNotFound]: "认证记录不存在",
  [CodeVerifyAlreadyExist]: "认证记录已存在",
  [CodeVerifyNotVerified]: "请先完成学生认证",
  [CodeVerifyStudentIDUsed]: "该学号已被其他用户认证",
  [CodeVerifyCannotApply]: "当前状态不允许申请认证",
  [CodeVerifyCannotConfirm]: "当前状态不允许确认认证",
  [CodeVerifyCannotCancel]: "当前状态不允许取消认证",
  [CodeVerifyRateLimit]: "申请过于频繁，请20秒后再试",
  [CodeVerifyInvalidTransit]: "无效的状态转换",
  [CodeVerifyPermissionDeny]: "无权操作此认证记录",
  [CodeVerifyRejectCooldown]: "您的认证申请被拒绝后24小时内不能重新申请",

  // 用户服务 - OCR识别
  [CodeOcrNetworkTimeout]: "识别服务繁忙，请稍后重试",
  [CodeOcrImageInvalid]: "图片无效，请上传清晰的学生证照片",
  [CodeOcrRecognizeFailed]: "识别失败，请重新上传照片",
  [CodeOcrServiceUnavailable]: "识别服务暂不可用，请稍后重试",
  [CodeOcrInsufficientBalance]: "识别服务暂不可用，请联系管理员",
  [CodeOcrEmptyResult]: "未能识别到有效信息，请上传清晰的学生证照片",
  [CodeOcrConfigInvalid]: "识别服务配置错误，请联系管理员",

  // 用户服务 - 文件服务
  [CodeFileTooLarge]: "文件大小超过限制",
  [CodeFileTypeInvalid]: "不支持的文件类型",
  [CodeFileUploadFailed]: "文件上传失败，请稍后重试",
  [CodeFileDeleteFailed]: "文件删除失败，请稍后重试",
  [CodeFileConfigError]: "文件服务配置错误，请联系管理员",

  // 用户服务 - 标签业务
  [CodeUserTagUpdateFailed]: "用户标签更新失败，请稍后重试",

  // 用户服务 - 验证码与消息
  [CodeCaptchaNotFound]: "验证码不存在或已过期",
  [CodeCaptchaError]: "验证码错误",
  [CodeCaptchaTooManyAttempts]: "验证码错误次数过多，请重新获取",
  [CodeCaptchaRateLimit]: "验证码发送过于频繁，请稍后再试",
  [CodeEmailSendFailed]: "邮件发送失败，请检查邮箱是否正确",
  [CodeGeetestConfigError]: "验证服务配置错误，请联系管理员",
  [CodeGeetestVerifyFailed]: "验证失败，请刷新页面重试",

  // 活动服务 - 活动
  [CodeActivityNotFound]: "活动不存在",
  [CodeActivityStatusInvalid]: "活动状态不允许此操作",
  [CodeActivityTimeInvalid]: "活动时间设置无效",
  [CodeActivityConcurrentUpdate]: "操作冲突，请重试",
  [CodeActivityPermissionDenied]: "无权限操作此活动",
  [CodeActivityHasRegistration]: "有报名记录的活动不能删除",

  // 活动服务 - 分类
  [CodeCategoryNotFound]: "分类不存在",
  [CodeCategoryDisabled]: "分类已禁用",

  // 活动服务 - 标签
  [CodeTagNotFound]: "标签不存在",
  [CodeTagLimitExceeded]: "最多选择5个标签",

  // 聊天服务 - 群组
  [CodeGroupNotFound]: "群组不存在",
  [CodeGroupPermissionDenied]: "无权限操作此群组",
  [CodeGroupStatusInvalid]: "群组状态不允许此操作",
  [CodeGroupMemberNotFound]: "群成员不存在",
  [CodeGroupMemberExists]: "用户已是群成员",
  [CodeGroupFull]: "群组人数已满",
  [CodeGroupOwnerCannotLeave]: "群主不能退出群组",

  // 聊天服务 - 消息
  [CodeMessageNotFound]: "消息不存在",
  [CodeMessageContentEmpty]: "消息内容不能为空",
  [CodeMessageTypeInvalid]: "消息类型无效",
  [CodeMessageTooLong]: "消息内容过长",
  [CodeMessageSendFailed]: "消息发送失败",
  [CodeMessageDeleteFailed]: "消息删除失败",
  [CodeMessageNotInGroup]: "不在该群组中，无法发送消息",

  // 聊天服务 - 通知
  [CodeNotificationNotFound]: "通知不存在",
  [CodeNotificationAlreadyRead]: "通知已读",
  [CodeNotificationMarkFailed]: "标记通知失败",
  [CodeNotificationPermissionDeny]: "无权限操作此通知",

  // 聊天服务 - 用户状态
  [CodeUserStatusNotFound]: "用户状态不存在",
  [CodeUserStatusUpdateFail]: "更新用户状态失败",
};

/**
 * 根据业务码获取消息
 */
export function getBusinessCodeMessage(code: number): string {
  return BusinessCodeMessages[code] || "未知错误";
}

/**
 * 判断是否需要自动跳转到登录页
 */
export function shouldRedirectToLogin(code: number): boolean {
  return (
    code === CodeLoginRequired ||
    code === CodeTokenInvalid ||
    code === CodeTokenExpired ||
    code === CodeRefreshTokenInvalid ||
    code === CodeRefreshTokenExpired
  );
}

/**
 * 判断是否为 Token 相关错误
 */
export function isTokenError(code: number): boolean {
  return (
    code === CodeTokenInvalid ||
    code === CodeTokenExpired ||
    code === CodeRefreshTokenInvalid ||
    code === CodeRefreshTokenExpired
  );
}

/**
 * 判断是否为可重试的错误
 */
export function isRetryableError(code: number): boolean {
  return (
    code === CodeTooManyRequests ||
    code === CodeTimeout ||
    code === CodeServiceUnavailable ||
    code === CodeDBError ||
    code === CodeCacheError ||
    code === CodeRPCError ||
    code === CodeOcrNetworkTimeout ||
    code === CodeOcrServiceUnavailable
  );
}
