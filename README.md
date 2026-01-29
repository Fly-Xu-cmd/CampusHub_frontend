> **文档版本**: 2.0.0 (SSR 实战版)
> **最后更新**: 2026-01-28
> **适用范围**: 前端开发团队 (徐飞、闻添祥、杨思见)

## 1. 项目概述

CampusHub 是一个基于 **uni-app + Vue 3 + TypeScript + Vite** 技术栈开发的跨平台校园应用。

**核心架构目标**：一套代码同时支持 **H5 SSR (服务端渲染)** 和 **微信小程序**，并保证双端 UI 像素级一致性。

## 2. 技术栈与环境

| **类别** | **技术方案**       | **关键说明**                  |
| -------- | ------------------ | ----------------------------- |
| **框架** | uni-app (Vue 3)    | 组合式 API (`<script setup>`) |
| **构建** | Vite 5.x           | 极速冷启动                    |
| **语言** | TypeScript 4.9+    | 强类型约束                    |
| **状态** | Pinia              | 持久化 + SSR 状态同步         |
| **UI库** | **Wot Design Uni** | 京东风格，TS 支持完美         |
| **CSS**  | SCSS               | 配合 `uni.scss` 全局变量      |

### 环境要求

- **Node.js**: 16.0+ (SSR 构建强依赖)
- **IDE**: HBuilderX (推荐) 或 VS Code
- **调试工具**: 微信开发者工具 (最新版)

---

## 3. 开发命令与 SSR 规范 (核心)

由于本项目开启了 H5 SSR，**必须**严格区分开发指令，否则会导致 H5 端白屏。

### 常用指令

| **场景**        | **终端命令**             | **说明**                             |
| --------------- | ------------------------ | ------------------------------------ |
| **H5 本地调试** | `npm run dev:h5 --ssr`   | **务必带上 `--ssr`**，模拟服务端环境 |
| **小程序调试**  | `npm run dev:mp-weixin`  | 编译至 `dist/dev/mp-weixin`          |
| **H5 生产构建** | `npm run build:h5 --ssr` | 产出包含 server/client 的双端包      |
| **类型检查**    | `npm run type-check`     | 提交代码前必跑                       |

### SSR 避坑指南 (严禁踩雷)

1. **生命周期隔离**:
   - `onBeforeMount`: 在服务端和客户端都会执行。**严禁**在此操作 `window`, `document`, `localstorage`。
   - `onMounted`: 仅在客户端执行。**所有 DOM 操作、Echarts 初始化必须放在这里。**

2. **网络请求**:
   - 必须使用封装好的 `@/utils/http` (基于 `uni.request`)。
   - 禁止使用 `axios` (除非你配置了 adapter)，因为 uni.request 会自动处理 SSR 的 HTTP 协议差异。

3. **条件编译**:

   涉及平台差异代码，必须用注释包裹：

   TypeScript

   ```
   // #ifdef H5
   console.log('这段代码只在 H5 SSR 或浏览器运行');
   // #endif

   // #ifdef MP-WEIXIN
   console.log('这段代码只在微信小程序运行');
   // #endif
   ```

---

## 4. 项目结构与布局规范

### 目录结构

Plaintext

```
├── src/
│   ├── components/
│   │   ├── CommonLayout/     # [核心] 通用布局组件 (处理导航栏/Tabbar)
│   │   ├── TabBar/           # [核心] 自定义底部导航
│   │   └── AsyncLoading.vue  # SSR 加载占位
│   ├── pages/                # 业务页面
│   ├── store/
│   │   └── system.ts         # [核心] 系统布局信息 (安全区/胶囊高度)
│   ├── styles/
│   │   └── variables.scss    # 全局变量
│   ├── utils/
│   │   └── platform.ts       # 平台判断工具
│   ├── App.vue
│   └── main.ts
```

### UI 开发规范

1. **布局组件强制使用**:

   所有页面**不能**裸写 `view`，必须被 `CommonLayout` 包裹，以处理 iOS 底部黑条和小程序胶囊遮挡。

   HTML

   ```
   <template>
     <CommonLayout headerType="standard" title="页面标题" showBack>
        <view class="content">...</view>
     </CommonLayout>
   </template>
   ```

2. **单位**: 统一使用 `rpx`。
3. **样式**:
   - 禁止使用 `float`，全员 `Flex` 布局。
   - 背景图禁止使用本地路径（小程序限制），需用 Base64 或网络图片。

---

## 5. 团队协作与 Git 规范

### 分支管理

- `main`: 生产环境分支 (稳定版)
- `develop`: 开发主分支 (日常合并)
- `feat/<name>`: 功能分支 (如 `feat/home`)

### 提交工作流示例

Bash

```
# 1. 切换到开发分支并拉取最新代码
git checkout develop
git pull origin develop

# 2. 创建自己的功能分支
git checkout -b feat/home

# 3. 开发完成后提交 (Angular 规范)
git add .
git commit -m "feat(home): 完成首页布局与轮播图组件"

# 4. 推送并请求合并
git push origin feat/home
```

---

## 7. 常见问题 (FAQ)

**Q: 为什么 H5 页面刷新后报错 `window is not defined`?**

A: 这是因为 SSR 在服务端执行了组件代码。请检查是否在 `setup` 或 `created` 里直接用了 `window`。请移至 `onMounted`。

**Q: 导航栏在小程序上被胶囊挡住了？**

A: 检查是否使用了 `CommonLayout` 组件。如果没有，请手动调用 `useSystemStore().navBarHeight` 获取避让高度。

**Q: 依赖安装报错 `ERESOLVE`?**

A: 请使用 `npm install --legacy-peer-deps` 忽略 Vue 版本微小差异导致的冲突。
