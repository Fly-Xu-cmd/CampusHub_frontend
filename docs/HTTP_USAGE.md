# HTTP 请求与业务码处理

## 概述

本项目的 HTTP 请求处理已完善，支持：
- ✅ HTTP 状态码处理（401、404、500等）
- ✅ 业务码处理（0=成功，其他为错误）
- ✅ Token 过期自动刷新
- ✅ 友好的错误提示
- ✅ 可配置的错误显示

## 业务码规范

```
0       - 成功
1xxx    - 通用错误
2xxx    - 用户服务错误
3xxx    - 活动服务错误
4xxx    - 聊天服务错误
```

详见 `src/utils/businessCodes.ts`

## 基础用法

### 1. 普通请求（自动显示错误）

```typescript
import { get, post } from '@/utils/http';

// GET 请求
const response = await get<UserInfo>('/api/v1/users/details');

// POST 请求
const result = await post<LoginData>('/api/v1/login', {
  username: 'test',
  password: '123456'
});
```

### 2. 自定义错误处理

```typescript
import { get } from '@/utils/http';
import { CodeUserNotFound, CodeCreditCannotPublish } from '@/utils/businessCodes';

try {
  const response = await get<ActivityInfo>('/api/v1/activity/123', {
    showErrorToast: true // 默认为 true
  });
} catch (error: any) {
  // 业务错误会自动显示 toast，这里可以做额外处理
  if (error.message?.includes('业务错误')) {
    const code = parseInt(error.message.match(/\((\d+)\)/)?.[1] || '0');

    if (code === CodeUserNotFound) {
      // 用户不存在
      console.log('用户不存在，执行特定逻辑');
    }

    if (code === CodeCreditCannotPublish) {
      // 信用分不足
      uni.showModal({
        title: '无法发布',
        content: '您的信用分不足90分，暂时无法发布活动',
        showCancel: false
      });
    }
  }
}
```

### 3. 禁用自动错误提示

```typescript
import { post } from '@/utils/http';

try {
  const response = await post<Data>('/api/v1/some-api', data, {
    showErrorToast: false // 禁用自动 toast
  });

  // 自定义错误处理
} catch (error) {
  // 完全自定义的错误处理
  uni.showModal({
    title: '操作失败',
    content: error.message,
    success: () => {
      // 自定义逻辑
    }
  });
}
```

### 4. 禁用 Token 自动刷新

```typescript
import { get } from '@/utils/http';

const response = await get<Data>('/api/v1/some-api', null, {
  autoRefresh: false // 默认为 true，禁用 Token 自动刷新
});
```

## 常用业务码

### 用户认证相关

```typescript
import {
  CodeLoginRequired,      // 2001 - 需要登录
  CodeTokenInvalid,       // 2002 - Token无效
  CodeTokenExpired,       // 2003 - Token已过期
  CodeLoginFailed,        // 2017 - 账号或密码错误
  CodeUserEmailAlreadyExists, // 2016 - 邮箱已注册
} from '@/utils/businessCodes';
```

### 密码相关

```typescript
import {
  CodePasswordInvalid,    // 2051 - 密码格式不正确
  CodePasswordIncorrect,  // 2052 - 原密码错误
  CodePasswordUpdateFailed, // 2053 - 密码修改失败
} from '@/utils/businessCodes';
```

### 学生认证相关

```typescript
import {
  CodeVerifyNotFound,       // 2201 - 认证记录不存在
  CodeVerifyNotVerified,    // 2203 - 用户未通过学生认证
  CodeVerifyStudentIDUsed,  // 2204 - 学号已被其他用户认证
  CodeOcrImageInvalid,      // 2232 - 图片无效或无法识别
  CodeOcrRecognizeFailed,   // 2233 - OCR识别失败
} from '@/utils/businessCodes';
```

### 信用分相关

```typescript
import {
  CodeCreditCannotPublish,  // 2105 - 信用分不足，无法发布
  CodeCreditRiskLimit,      // 2104 - 风险用户已达每日限制
} from '@/utils/businessCodes';
```

### 文件上传相关

```typescript
import {
  CodeFileTooLarge,        // 2301 - 文件超过大小限制
  CodeFileTypeInvalid,     // 2302 - 文件类型不支持
  CodeFileUploadFailed,    // 2303 - 文件上传失败
} from '@/utils/businessCodes';
```

## 实际应用示例

### 示例 1：登录处理

```typescript
import { post } from '@/utils/http';
import { authApi } from '@/api/register/router';
import { CodeLoginFailed, CodeUserDisabled } from '@/utils/businessCodes';

const handleLogin = async () => {
  try {
    const response = await authApi.login({
      username: form.username,
      password: form.password
    });

    // 登录成功
    uni.showToast({ title: '登录成功', icon: 'success' });
    userStore.login(response.data.userInfo, response.data.accessToken);

  } catch (error: any) {
    // 错误已自动显示 toast，这里可以做额外处理
    const code = extractBusinessCode(error.message);

    if (code === CodeUserDisabled) {
      uni.showModal({
        title: '账号已禁用',
        content: '您的账号已被禁用，请联系管理员',
        showCancel: false
      });
    }
  }
};

// 辅助函数：从错误消息中提取业务码
function extractBusinessCode(errorMessage: string): number {
  const match = errorMessage.match(/业务错误\((\d+)\)/);
  return match ? parseInt(match[1]) : 0;
}
```

### 示例 2：学生认证申请

```typescript
import { post } from '@/utils/http';
import { postStudentAuth } from '@/api/profile/router';
import {
  CodeVerifyRateLimit,
  CodeOcrImageInvalid,
  CodeOcrRecognizeFailed
} from '@/utils/businessCodes';

const submitVerification = async (formData: any) => {
  try {
    uni.showLoading({ title: '提交中...' });

    const response = await postStudentAuth({
      real_name: formData.realName,
      school_name: formData.schoolName,
      // ... 其他字段
    }, {
      showErrorToast: true // 显示自动错误提示
    });

    uni.hideLoading();
    uni.showToast({ title: '提交成功', icon: 'success' });

  } catch (error: any) {
    uni.hideLoading();

    const code = extractBusinessCode(error.message);

    // 针对特定错误码的额外处理
    if (code === CodeVerifyRateLimit) {
      // 申请过于频繁，显示倒计时
      showCountdown(20);
    }

    if (code === CodeOcrImageInvalid) {
      // 图片无效，提示用户
      uni.showToast({
        title: '请上传清晰的学生证照片',
        icon: 'none',
        duration: 3000
      });
    }
  }
};
```

### 示例 3：文件上传

```typescript
import { post } from '@/utils/http';
import {
  CodeFileTooLarge,
  CodeFileTypeInvalid,
  CodeFileUploadFailed
} from '@/utils/businessCodes';

const uploadAvatar = async (filePath: string) => {
  try {
    uni.showLoading({ title: '上传中...' });

    const response = await post('/api/v1/upload/avatar', {
      file: filePath
    }, {
      showErrorToast: true
    });

    uni.hideLoading();
    return response.data.url;

  } catch (error: any) {
    uni.hideLoading();

    const code = extractBusinessCode(error.message);

    if (code === CodeFileTooLarge) {
      uni.showToast({
        title: '文件大小不能超过 5MB',
        icon: 'none',
        duration: 3000
      });
    }

    if (code === CodeFileTypeInvalid) {
      uni.showToast({
        title: '仅支持 JPG、PNG 格式',
        icon: 'none',
        duration: 3000
      });
    }

    return null;
  }
};
```

## 工具函数

### getBusinessCodeMessage

获取业务码对应的默认消息：

```typescript
import { getBusinessCodeMessage } from '@/utils/businessCodes';

const message = getBusinessCodeMessage(2016); // "该邮箱已注册"
```

### shouldRedirectToLogin

判断是否需要跳转到登录页：

```typescript
import { shouldRedirectToLogin } from '@/utils/businessCodes';

if (shouldRedirectToLogin(code)) {
  // 自动跳转到登录页
}
```

### isTokenError

判断是否为 Token 相关错误：

```typescript
import { isTokenError } from '@/utils/businessCodes';

if (isTokenError(code)) {
  // Token 错误，触发刷新
}
```

### isRetryableError

判断是否为可重试的错误：

```typescript
import { isRetryableError } from '@/utils/businessCodes';

if (isRetryableError(code)) {
  // 显示重试按钮
  showRetryButton();
}
```

## 最佳实践

### 1. 统一错误处理

在大多数情况下，使用默认的错误处理即可：

```typescript
// ✅ 推荐：使用默认错误处理
const data = await api.getData();

// ❌ 不推荐：每次都手动处理错误
try {
  const data = await api.getData();
} catch (error) {
  // 不必要的手动处理
}
```

### 2. 特定场景的定制处理

对于需要特殊处理的场景，捕获错误并定制：

```typescript
try {
  const data = await api.publishActivity(activityData);
} catch (error: any) {
  const code = extractBusinessCode(error.message);

  // 信用分不足的特殊处理
  if (code === CodeCreditCannotPublish) {
    uni.showModal({
      title: '无法发布',
      content: '您的信用分不足90分，暂时无法发布活动。参与更多活动可以提高信用分哦～',
      confirmText: '我知道了',
      showCancel: false
    });
    return;
  }

  // 其他错误已自动显示 toast
}
```

### 3. 静默请求

对于不需要显示错误的请求：

```typescript
// 日志上报等静默请求
await post('/api/v1/log', logData, {
  showErrorToast: false
});
```

### 4. 批量请求

对于批量请求，统一处理错误：

```typescript
const requests = [
  get('/api/v1/data1'),
  get('/api/v1/data2'),
  get('/api/v1/data3'),
];

const results = await Promise.allSettled(requests);

const failed = results.filter(r => r.status === 'rejected');
if (failed.length > 0) {
  console.log(`${failed.length} 个请求失败`);
}
```

## Token 自动刷新机制

当收到 Token 过期的业务码时，系统会：

1. 自动使用 refreshToken 获取新的 accessToken
2. 使用新 token 重试原请求
3. 如果刷新失败，清除登录状态并跳转登录页

如需禁用此功能：

```typescript
await get('/api/v1/some-api', null, {
  autoRefresh: false
});
```

## 总结

- ✅ 大多数情况下使用默认错误处理即可
- ✅ 业务错误会自动显示友好的 toast 提示
- ✅ Token 过期会自动刷新并重试
- ✅ 特定场景可以捕获错误进行定制处理
- ✅ 使用 `showErrorToast: false` 禁用自动提示
- ✅ 使用 `autoRefresh: false` 禁用 Token 自动刷新
