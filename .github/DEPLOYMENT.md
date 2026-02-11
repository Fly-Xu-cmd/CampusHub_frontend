# GitHub Actions 部署说明

## 工作流概述

本项目包含两个 GitHub Actions 工作流：

### 1. CI 工作流 (`.github/workflows/ci.yml`)
- **触发时机**: Pull Request 到 main/master/develop 分支
- **执行内容**:
  - TypeScript 类型检查
  - 构建 H5 版本（验证）
  - 构建微信小程序版本（验证）

### 2. Deploy 工作流 (`.github/workflows/deploy.yml`)
- **触发时机**:
  - Push 到 main/master 分支
  - 手动触发 (workflow_dispatch)
- **执行内容**:
  - TypeScript 类型检查
  - 构建 H5 SSR 版本
  - 构建微信小程序版本
  - 部署 H5 到生产服务器
  - 可选: 上传微信小程序到微信云

## 必需的 GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets (`Settings` → `Secrets and variables` → `Actions`):

### 环境变量 (Environment Variables)

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `VITE_PROD_BASE_URL` | 生产环境 API 地址 | `https://api.yourdomain.com` |
| `VITE_WS_URL` | WebSocket 地址 | `wss://ws.yourdomain.com/ws` |
| `VITE_GEETEST_ID` | 极验验证码 ID | `0994061370afc43d00014ffb8b5822c4` |

### 服务器部署配置 (SSH)

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SERVER_HOST` | 服务器地址 | `123.45.67.89` 或 `your-domain.com` |
| `SERVER_USERNAME` | SSH 用户名 | `root` 或 `ubuntu` |
| `SERVER_SSH_KEY` | SSH 私钥 | (完整的私钥内容) |
| `SERVER_PORT` | SSH 端口 (可选) | `22` |
| `DEPLOY_PATH` | 部署路径 | `/var/www/campushub` |

### 微信小程序配置 (可选)

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `WECHAT_APPID` | 微信小程序 AppID | `wxe343fd8e2e99956e` |
| `WECHAT_PRIVATE_KEY_PATH` | 微信上传密钥路径 | 需要在 repo 中提供密钥文件 |

## 配置步骤

### 1. 生成 SSH 密钥对

```bash
# 在本地生成密钥对
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server.com
```

### 2. 在 GitHub 添加 Secrets

1. 进入仓库设置: `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret` 添加每个 Secret
3. 对于 `SERVER_SSH_KEY`，粘贴**私钥**内容（`~/.ssh/github_actions_deploy` 的内容）

### 3. 服务器配置

#### 创建 PM2 配置文件 `ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'campus-hub',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # H5 SSR 服务
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend-server:8888/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket 代理
    location /ws/ {
        proxy_pass http://backend-server:8888/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

## 部署流程

### 自动部署

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

推送到 main 分支后，GitHub Actions 会自动：
1. 运行类型检查
2. 构建项目
3. 部署到服务器
4. 重启服务

### 手动触发

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择 `Build and Deploy` 工作流
4. 点击 `Run workflow` 按钮
5. 选择环境和分支
6. 点击运行

## 故障排查

### 常见问题

1. **SSH 连接失败**
   - 检查 `SERVER_SSH_KEY` 是否正确（应该是完整的私钥）
   - 确认服务器已添加对应的公钥
   - 检查服务器防火墙设置

2. **构建失败**
   - 检查 GitHub Secrets 中的环境变量是否完整
   - 查看构建日志获取详细错误信息

3. **部署后服务无法访问**
   - 检查 PM2 服务状态: `pm2 status`
   - 查看服务日志: `pm2 logs campus-hub`
   - 检查 Nginx 配置: `nginx -t && nginx -s reload`

## 本地测试构建

```bash
# 安装依赖
npm ci

# 设置环境变量
export VITE_PROD_BASE_URL="https://api.yourdomain.com"
export VITE_WS_URL="wss://ws.yourdomain.com/ws"
export VITE_DEBUG="false"

# 类型检查
npm run type-check

# 构建 H5 SSR
npm run build:h5:ssr

# 构建微信小程序
npm run build:mp-weixin
```
