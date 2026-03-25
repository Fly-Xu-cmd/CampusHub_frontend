/**
 * 表单验证工具函数
 * 统一处理 QQ 邮箱和密码复杂度验证
 */

// QQ邮箱正则（支持 xxx@qq.com、xxx@vip.qq.com、xxx@foxmail.com）
export const QQ_EMAIL_REGEX =
  /^[a-zA-Z0-9._-]{3,18}@(qq\.com|vip\.qq\.com|foxmail\.com)$/i;

// 密码复杂度正则
export const UPPERCASE_REGEX = /[A-Z]/;
export const LOWERCASE_REGEX = /[a-z]/;
export const DIGIT_REGEX = /[0-9]/;
export const SPECIAL_CHAR_REGEX =
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

/**
 * 验证 QQ 邮箱格式
 * @param email 邮箱地址
 * @returns 验证结果对象
 */
export function validateQQEmail(email: string): { valid: boolean; message: string } {
  if (!email) {
    return { valid: false, message: "请输入QQ邮箱" };
  }
  if (!QQ_EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      message: "请输入正确的QQ邮箱（xxx@qq.com/vip.qq.com/foxmail.com）",
    };
  }
  return { valid: true, message: "" };
}

/**
 * 密码验证结果
 */
export interface PasswordValidationResult {
  valid: boolean;
  message: string;
  details: {
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
    hasSpecialChar: boolean;
    typesCount: number;
  };
}

/**
 * 验证密码复杂度
 * 规则：8-20位，至少包含4种字符类型中的3种（大写、小写、数字、特殊符号）
 * @param password 密码
 * @returns 验证结果对象
 */
export function validatePassword(password: string): PasswordValidationResult {
  const result: PasswordValidationResult = {
    valid: false,
    message: "",
    details: {
      hasUppercase: false,
      hasLowercase: false,
      hasDigit: false,
      hasSpecialChar: false,
      typesCount: 0,
    },
  };

  if (!password) {
    result.message = "请输入密码";
    return result;
  }

  if (password.length < 8) {
    result.message = "密码长度至少8位";
    return result;
  }

  if (password.length > 20) {
    result.message = "密码长度不能超过20位";
    return result;
  }

  // 检查各类型字符
  result.details.hasUppercase = UPPERCASE_REGEX.test(password);
  result.details.hasLowercase = LOWERCASE_REGEX.test(password);
  result.details.hasDigit = DIGIT_REGEX.test(password);
  result.details.hasSpecialChar = SPECIAL_CHAR_REGEX.test(password);

  // 计算满足的类型数量
  result.details.typesCount =
    (result.details.hasUppercase ? 1 : 0) +
    (result.details.hasLowercase ? 1 : 0) +
    (result.details.hasDigit ? 1 : 0) +
    (result.details.hasSpecialChar ? 1 : 0);

  // 至少需要3种类型
  if (result.details.typesCount < 3) {
    const missing: string[] = [];
    if (!result.details.hasUppercase) missing.push("大写字母");
    if (!result.details.hasLowercase) missing.push("小写字母");
    if (!result.details.hasDigit) missing.push("数字");
    if (!result.details.hasSpecialChar) missing.push("特殊符号");

    result.message = `密码需包含大写字母、小写字母、数字、特殊符号中的至少3种，当前缺少：${missing.slice(0, 2).join("、")}`;
    return result;
  }

  result.valid = true;
  return result;
}

/**
 * 获取密码规则提示文本
 * @returns 密码规则说明
 */
export function getPasswordRulesHint(): string {
  return "密码需8-20位，包含大写字母、小写字母、数字、特殊符号中的至少3种";
}