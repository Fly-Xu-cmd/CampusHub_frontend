# 网络请求整改方案与验收清单

## 1. 问题分析

当前出现的 `net::ERR_CONNECTION_TIMED_OUT` 错误，根本原因在于请求的目标地址 `http://192.168.10.9:8888` 是一个局域网 IP。

- **真机调试问题**：手机和电脑必须连接同一 WiFi，且电脑防火墙需放行 8888 端口。
- **Android 限制**：Android 9+ 默认禁止 HTTP 明文传输，需开启 `usesCleartextTraffic`。
- **小程序限制**：小程序强制要求 HTTPS（除非开启“不校验合法域名”）。

## 2. 整改清单

### 2.1 域名与端口配置

| 环境         | 协议  | 域名/IP                      | 端口 | 备注                                |
| :----------- | :---- | :--------------------------- | :--- | :---------------------------------- |
| **开发环境** | HTTP  | 建议使用局域网 DNS 或电脑 IP | 8888 | 手机需连同一 WiFi，防火墙需放行端口 |
| **测试环境** | HTTPS | `test-api.yourdomain.com`    | 443  | 必须配置 SSL 证书                   |
| **生产环境** | HTTPS | `api.yourdomain.com`         | 443  | 必须配置 SSL 证书，支持 HTTP/2      |

### 2.2 安全配置（TLS 与加密）

- **最小 TLS 版本**: TLS 1.2
- **推荐加密套件**:
  - `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`
  - `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
  - `TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`
- **HSTS**: 建议服务端开启，强制客户端使用 HTTPS。

### 2.3 超时与重试策略

已在 `src/utils/http.ts` 中实现：

- **默认超时**: 30000ms (30 秒)
- **重试次数**: 默认 0 次，关键接口建议配置 3 次。
- **重试机制**: 指数退避 (1s, 2s, 4s...)。
- **配置方式**:
  ```typescript
  http({ url: "/api/...", retry: 3, retryDelay: 1000 });
  ```

### 2.4 错误码映射表

已在 `src/utils/http.ts` 中实现：
| 状态码 | 描述 | 处理动作 |
| :--- | :--- | :--- |
| 401 | 未授权 | 清除 Token，跳转登录页 |
| 403 | 拒绝访问 | 提示用户无权限 |
| 404 | 资源不存在 | 检查 URL 是否正确 |
| 408/timeout | 请求超时 | 自动重试（如配置）或提示检查网络 |
| 500+ | 服务端错误 | 提示“服务不可用”，上报日志 |
| request:fail | 网络中断 | 提示检查网络连接 |

## 3. 端到端验收脚本

在 Chrome 控制台或 H5 页面中运行以下代码进行自测：

```javascript
// 模拟弱网和断网测试脚本
async function runNetworkTest() {
  console.log("🚀 开始网络端到端测试...");

  // 1. 正常请求测试
  try {
    const start = Date.now();
    await uni.request({
      url: "http://192.168.10.9:8888/api/v1/users/details",
      method: "GET",
    });
    const duration = Date.now() - start;
    console.log(`✅ 正常请求通过，耗时: ${duration}ms`);
    if (duration > 600) console.warn("⚠️ 响应时间超过 600ms，需优化");
  } catch (e) {
    console.error("❌ 正常请求失败", e);
  }

  // 2. 模拟 404 测试
  try {
    await uni.request({
      url: "http://192.168.10.9:8888/api/404-test",
      method: "GET",
    });
  } catch (e) {
    // 预期失败，检查拦截器是否提示
    console.log("✅ 404 错误捕获测试通过（请确认是否弹出了提示）");
  }
}
```

**场景覆盖要求：**

1.  **弱网 (2G/3G)**: 使用 Chrome DevTools -> Network -> Throttling 模拟，请求不应崩坏，应触发超时提示。
2.  **断网**: 关闭 WiFi/流量，请求应立即返回 `request:fail` 并提示“网络连接失败”。
3.  **DNS 劫持**: 模拟 hosts 修改域名指向错误 IP，应触发超时或连接拒绝。

## 4. 上线前 Checklist

- [ ] **Android**: `manifest.json` 中 `usesCleartextTraffic` 是否已设置为 `true`？
- [ ] **小程序**: 微信后台“开发设置”中是否已配置 Request 合法域名？
- [ ] **HTTPS**: 生产环境域名是否 SSL 证书不过期？是否支持 HTTP/2？
- [ ] **防火墙**: 服务器防火墙是否放行了 8888 (测试) 或 443 (生产) 端口？
- [ ] **User-Agent**: 后端是否已添加对 `CampusHub/1.0.0` UA 的日志分析支持？
- [ ] **CDN**: 是否配置了 CDN 预热（针对静态资源）？

## 5. 回滚方案

由于本次修改主要在前端代码和配置：

1.  **代码回滚**: 使用 Git 回退到修改前的 commit。
    ```bash
    git revert <commit-id>
    ```
2.  **配置回滚**:
    - 如果 Android 因 `usesCleartextTraffic` 导致审核不通过（Google Play 策略），需移除该配置并全面切换 HTTPS。
    - 小程序若因域名校验失败，临时开启“开发版不校验域名”开关。
