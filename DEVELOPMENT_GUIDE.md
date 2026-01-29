# CampusHub 项目开发文档

本文档详细说明了 CampusHub 项目的开发流程、技术栈、项目结构和配置等内容，为开发人员提供全面的开发指南。

## 项目概述

CampusHub 是一个基于 uni-app 框架开发的跨平台校园应用，支持 H5 和微信小程序等多个平台。项目旨在为校园用户提供一站式的校园服务体验，包括活动报名、个人中心等功能。

## 技术栈

| 类别     | 技术/框架  | 版本    | 说明                       |
| -------- | ---------- | ------- | -------------------------- |
| 前端框架 | uni-app    | 3.0.0   | 跨平台应用开发框架         |
| Vue      | Vue 3      | ^3.4.21 | 前端视图框架               |
| 开发语言 | TypeScript | ^4.9.4  | 类型安全的 JavaScript 超集 |
| 构建工具 | Vite       | 5.2.8   | 现代化前端构建工具         |
| 状态管理 | Pinia      | -       | 轻量级状态管理库           |
| 国际化   | vue-i18n   | ^9.1.9  | 国际化支持                 |

## 项目结构

```
├── dist/             # 构建输出目录
├── src/              # 源代码目录
│   ├── components/   # 组件目录
│   │   ├── AsyncLoading.vue # SSR 加载状态组件
│   │   ├── AsyncError.vue   # SSR 错误状态组件
│   │   └── CommonLayout/    # 通用布局组件
│   ├── pages/        # 页面目录
│   ├── store/        # 状态管理目录
│   ├── styles/       # 样式目录
│   │   ├── variables.scss   # 全局变量
│   │   └── mixins.scss      # 混合器
│   ├── utils/        # 工具目录
│   │   └── platform.ts      # 平台判断工具
│   ├── static/       # 静态资源
│   ├── App.vue       # 应用根组件
│   ├── main.ts       # 应用入口
│   ├── manifest.json # uni-app 配置文件
│   ├── pages.json    # 页面路由配置
│   └── uni.scss      # 全局样式
├── .gitignore        # Git 忽略文件
├── package.json      # 项目依赖配置
├── tsconfig.json     # TypeScript 配置
├── vite.config.ts    # Vite 配置文件
├── USAGE_GUIDE.md    # 使用指南
└── DEVELOPMENT_GUIDE.md # 开发文档
```

## 开发环境搭建

### 1. 环境要求

- Node.js 14.0+
- npm 6.0+ 或 yarn 1.22+
- HBuilderX（推荐，用于 uni-app 开发和预览）
- 微信开发者工具（用于微信小程序预览和调试）

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install
```

### 3. 开发命令

| 命令                      | 说明                     | 平台       |
| ------------------------- | ------------------------ | ---------- |
| `npm run dev:h5`          | 启动 H5 开发服务器       | H5         |
| `npm run dev:mp-weixin`   | 启动微信小程序开发服务器 | 微信小程序 |
| `npm run build:h5`        | 构建 H5 版本             | H5         |
| `npm run build:mp-weixin` | 构建微信小程序版本       | 微信小程序 |
| `npm run type-check`      | TypeScript 类型检查      | 所有平台   |

### 4. 预览与调试

#### H5 预览

1. 运行 `npm run dev:h5` 启动开发服务器
2. 在浏览器中访问命令输出的 URL

#### 微信小程序预览

1. 运行 `npm run dev:mp-weixin` 启动开发服务器
2. 打开微信开发者工具
3. 导入 `dist/dev/mp-weixin` 目录
4. 在微信开发者工具中预览和调试

## 开发流程

### 1. 代码分支管理

- `main`：主分支，用于发布生产版本
- `develop`：开发分支，用于集成新功能
- `feature/*`：特性分支，用于开发新功能
- `bugfix/*`：修复分支，用于修复 bug

### 2. 开发规范

#### 命名规范

- **文件命名**：使用 PascalCase，如 `CommonLayout.vue`
- **组件命名**：使用 PascalCase，如 `CommonLayout.vue`
- **变量命名**：使用 camelCase，如 `navBarHeight`
- **常量命名**：使用 UPPER_SNAKE_CASE，如 `MAX_LENGTH`
- **函数命名**：使用 camelCase，如 `handleClick`

#### 代码风格

- 使用 2 个空格进行缩进
- 每行代码长度不超过 120 个字符
- 使用单引号 `'` 而非双引号 `"`
- 大括号 `{` 与代码在同一行
- 关键字 `if`、`else`、`for`、`while` 等与大括号之间有空格
- 运算符两侧有空格
- 函数参数之间有空格

#### TypeScript 规范

- 为所有变量和函数添加类型注解
- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型和交叉类型
- 避免使用 `any` 类型，如必须使用，需添加注释说明

#### Vue 3 规范

- 使用 Composition API
- 使用 `<script setup>` 语法
- 组件 props 和 emit 使用 TypeScript 类型定义
- 使用 `ref` 和 `reactive` 管理响应式状态
- 合理使用 `watch` 和 `computed`

### 3. 组件开发

#### 组件创建流程

1. 在 `src/components` 目录下创建组件文件夹
2. 创建 `ComponentName.vue` 文件
3. 编写组件代码，包括模板、脚本和样式
4. 根据uni-app的组件注册规则，在需要使用的页面中直接使用组件

#### 组件示例

```vue
<template>
  <view class="example-component">
    <text>{{ message }}</text>
    <button @click="handleClick">点击按钮</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Props
interface Props {
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: "Hello CampusHub",
});

// Emits
const emit = defineEmits<{
  (e: "click", value: string): void;
}>();

// 响应式状态
const count = ref(0);

// 方法
const handleClick = () => {
  count.value++;
  emit("click", `Button clicked ${count.value} times`);
};
</script>

<style scoped lang="scss">
.example-component {
  padding: $spacing-md;
  background-color: $surface-color;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
}
</style>
```

### 4. 页面开发

#### 页面创建流程

1. 在 `src/pages` 目录下创建页面文件夹
2. 创建 `index.vue` 文件
3. 在 `pages.json` 中注册页面
4. 编写页面代码

#### 页面示例

```vue
<template>
  <CommonLayout title="页面标题" showBack>
    <view class="page-content">
      <text>页面内容</text>
    </view>
  </CommonLayout>
</template>

<script setup lang="ts">
import CommonLayout from "@/components/CommonLayout/CommonLayout.vue";

// 页面逻辑
</script>

<style scoped lang="scss">
.page-content {
  padding: $spacing-md;
}
</style>
```

## 状态管理

项目使用 Pinia 进行状态管理，状态管理文件位于 `src/store` 目录下。

### 创建 Store

```typescript
// src/store/user.ts
import { defineStore } from "pinia";
import type { UserState } from "@/types/user";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    userId: "",
    username: "",
    avatar: "",
    isLoggedIn: false,
  }),

  getters: {
    userInfo(): Partial<UserState> {
      return {
        userId: this.userId,
        username: this.username,
        avatar: this.avatar,
      };
    },
  },

  actions: {
    login(userId: string, username: string, avatar: string) {
      this.userId = userId;
      this.username = username;
      this.avatar = avatar;
      this.isLoggedIn = true;
    },

    logout() {
      this.userId = "";
      this.username = "";
      this.avatar = "";
      this.isLoggedIn = false;
    },
  },
});
```

### 使用 Store

```typescript
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

// 获取状态
const isLoggedIn = userStore.isLoggedIn;

// 修改状态
userStore.login("123", "张三", "avatar.png");

// 重置状态
userStore.logout();
```

## 样式系统

项目使用 SCSS 作为样式预处理器，并建立了完整的样式系统。

### 全局变量

全局变量定义在 `src/styles/variables.scss` 文件中，包括颜色、字体、间距等。

### 混合器

混合器定义在 `src/styles/mixins.scss` 文件中，提供了响应式布局、弹性布局、卡片样式等可复用的样式片段。

### 样式使用

```scss
<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  background-color: $background-color;
  padding: $spacing-md;

  @include flex(row, space-between, center);

  @include responsive('mobile') {
    @include flex(column, flex-start, stretch);
  }
}

.card {
  @include card;
}

.button {
  @include button($primary-color);
}
</style>
```

## 平台适配

项目使用 `platform.ts` 工具文件进行平台判断，支持不同平台的适配。

### 平台判断

```typescript
import { platform } from "@/utils/platform";

// 判断是否为小程序
if (platform.isMiniProgram()) {
  // 小程序特定逻辑
}

// 判断是否为 H5
if (platform.isH5()) {
  // H5 特定逻辑
}

// 判断是否为移动设备
if (platform.isMobile()) {
  // 移动设备特定逻辑
}

// 判断是否为电脑端
if (platform.isDesktop()) {
  // 电脑端特定逻辑
}

// 获取当前平台类型
const platformType = platform.getPlatformType();
console.log("当前平台:", platformType);
```

### 平台特定样式

```scss
@include platform-specific("h5") {
  // H5 特定样式
}

@include platform-specific("mp-weixin") {
  // 微信小程序特定样式
}
```

## 网络请求

项目使用 `http.ts` 工具文件进行网络请求，提供了丰富的功能，包括请求拦截、响应处理、缓存机制、取消请求等。

### 基本使用

```typescript
import { http, get, post } from "@/utils/http";

// 使用 http 函数
const fetchData = async () => {
  const data = await http<DataType>({
    url: "/api/data",
    method: "GET",
    cache: true, // 启用缓存
    retry: 3, // 失败重试 3 次
  });
  return data;
};

// 使用快捷方法
const getUser = async (id: string) => {
  return await get<User>(`/api/users/${id}`);
};

const createUser = async (userData: User) => {
  return await post<User>("/api/users", userData);
};
```

### 高级功能

#### 1. 取消请求

```typescript
import { http, createCancelToken } from "@/utils/http";

// 创建取消令牌
const cancelToken = createCancelToken();

// 发送请求
const fetchData = async () => {
  try {
    const data = await http<DataType>({
      url: "/api/data",
      cancelToken,
    });
    return data;
  } catch (error: any) {
    if (error.message === "Request cancelled") {
      console.log("请求已取消");
    }
    throw error;
  }
};

// 取消请求
const cancelRequest = () => {
  cancelToken.cancel("用户取消请求");
};
```

#### 2. 缓存使用

```typescript
import { http, clearCache } from "@/utils/http";

// 启用缓存
const fetchData = async () => {
  return await http<DataType>({
    url: "/api/data",
    method: "GET",
    cache: true,
    cacheKey: "unique-cache-key", // 自定义缓存键
  });
};

// 清除缓存
const clearDataCache = () => {
  clearCache("unique-cache-key"); // 清除指定缓存
  // 或 clearCache(); // 清除所有缓存
};
```

#### 3. 统一错误处理

```typescript
import { http } from "@/utils/http";

// 封装请求方法
export const request = async <T>(options: RequestOptions) => {
  try {
    return await http<T>(options);
  } catch (error: any) {
    // 处理业务错误
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          // 未授权，跳转到登录页
          uni.redirectTo({ url: "/pages/login/login" });
          break;
        case 403:
          // 禁止访问
          uni.showToast({
            title: "无权限访问",
            icon: "none",
          });
          break;
        case 404:
          // 资源不存在
          uni.showToast({
            title: "请求的资源不存在",
            icon: "none",
          });
          break;
        case 500:
          // 服务器错误
          uni.showToast({
            title: "服务器内部错误",
            icon: "none",
          });
          break;
        default:
          // 其他错误
          uni.showToast({
            title: `请求失败: ${error.statusCode}`,
            icon: "none",
          });
      }
    }
    throw error;
  }
};
```

### 配置和扩展

#### 1. 环境配置

`http.ts` 根据 `NODE_ENV` 自动切换不同的 `BASE_URL`：

```typescript
// 环境配置
const env = process.env.NODE_ENV;

// 根据环境设置 BASE_URL
const BASE_URL =
  env === "production"
    ? "https://api.yourdomain.com"
    : "https://dev-api.yourdomain.com";
```

#### 2. 拦截器配置

可以在 `http.ts` 文件中修改拦截器，添加自定义逻辑：

```typescript
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
  // 添加更多拦截器...
];

// 响应拦截器
const responseInterceptors: Array<(response: Response) => Response> = [
  (response) => {
    // 统一处理响应数据
    return response;
  },
  // 添加更多拦截器...
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
    }
    return error;
  },
  // 添加更多拦截器...
];
```

## 配置说明

### 1. uni-app 配置

uni-app 配置文件位于 `src/manifest.json`，包括应用名称、版本号、平台特定配置等。

### 2. 页面路由配置

页面路由配置文件位于 `src/pages.json`，包括页面路径、导航栏配置、全局样式等。

### 3. TypeScript 配置

TypeScript 配置文件位于 `tsconfig.json`，包括编译选项、模块解析等。

### 4. Vite 配置

Vite 配置文件位于 `vite.config.ts`，包括构建选项、插件配置等。

## 常见问题与解决方案

### 1. H5 和小程序样式不一致

**问题**：H5 和小程序中的样式显示不一致。

**解决方案**：

- 使用 `uni.scss` 中定义的全局变量
- 使用 `platform.ts` 工具判断平台，针对特定平台做适配
- 使用 `@include platform-specific()` 混合器添加平台特定样式

### 2. 导航栏与胶囊按钮不对齐

**问题**：微信小程序中导航栏与胶囊按钮不对齐。

**解决方案**：

- 确保 `system.ts` 中的导航栏高度计算正确
- 检查 `CommonLayout.vue` 中的导航栏样式

### 3. 内容被状态栏或导航栏遮挡

**问题**：页面内容被状态栏或导航栏遮挡。

**解决方案**：

- 使用 `CommonLayout` 组件包裹页面内容
- 确保 `systemStore` 中的安全区域信息正确

### 4. TypeScript 类型错误

**问题**：TypeScript 类型检查失败。

**解决方案**：

- 为变量和函数添加正确的类型注解
- 避免使用 `any` 类型
- 检查 `tsconfig.json` 配置是否正确

### 5. SSR 相关问题

**问题**：H5 SSR 模式下出现错误。

**解决方案**：

- 确保 `AsyncLoading` 和 `AsyncError` 组件正确实现
- 检查 `manifest.json` 中的 SSR 配置
- 避免在 SSR 期间使用浏览器特定的 API

## 部署说明

### 1. H5 部署

1. 运行 `npm run build:h5` 构建 H5 版本
2. 将 `dist/build/h5` 目录下的文件部署到服务器
3. 配置服务器支持 `history` 模式的路由

### 2. 微信小程序部署

1. 运行 `npm run build:mp-weixin` 构建微信小程序版本
2. 打开微信开发者工具
3. 导入 `dist/build/mp-weixin` 目录
4. 上传代码并提交审核
5. 审核通过后发布小程序

## 性能优化

### 1. 代码优化

- 使用代码分割，减小初始包大小
- 避免使用过大的第三方库
- 合理使用 `v-if` 和 `v-show`
- 避免在模板中使用复杂表达式

### 2. 网络优化

- 使用 CDN 加速静态资源
- 启用 HTTP/2
- 合理使用缓存策略
- 减少 HTTP 请求次数

### 3. 渲染优化

- 使用虚拟列表处理长列表
- 合理使用 `keep-alive` 缓存组件
- 避免频繁的 DOM 操作
- 优化图片加载，使用适当的图片格式和尺寸

## 安全注意事项

- 避免在前端存储敏感信息
- 所有 API 请求必须经过后端验证
- 防止 XSS 攻击，对用户输入进行过滤
- 防止 CSRF 攻击，使用 token 验证
- 确保所有数据传输使用 HTTPS

## 开发工具推荐

| 工具           | 版本            | 用途                 | 下载链接                                                                        |
| -------------- | --------------- | -------------------- | ------------------------------------------------------------------------------- |
| HBuilderX      | 3.8.0+          | uni-app 开发 IDE     | [下载](https://www.dcloud.io/hbuilderx.html)                                    |
| 微信开发者工具 | 1.06.202309010+ | 微信小程序预览和调试 | [下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) |
| VS Code        | 1.80.0+         | 代码编辑器           | [下载](https://code.visualstudio.com/)                                          |
| TypeScript     | ^4.9.4          | TypeScript 支持      | [安装](https://www.typescriptlang.org/download)                                 |
| ESLint         | ^8.45.0         | 代码质量检查         | [安装](https://eslint.org/docs/latest/use/getting-started)                      |
| Prettier       | ^3.0.0          | 代码格式化           | [安装](https://prettier.io/docs/en/install.html)                                |

## 总结

本开发文档为 CampusHub 项目提供了全面的开发指南，包括技术栈、项目结构、开发流程、代码规范等内容。开发人员应严格遵循本指南进行开发，确保项目代码质量和可维护性。

如有任何疑问或建议，请及时与项目团队沟通。

---

**文档版本**：1.0.0
**最后更新**：2026-01-29
**责任编辑**：CampusHub 前端开发团队
