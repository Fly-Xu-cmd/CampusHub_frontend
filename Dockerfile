# ============================================
# 阶段 1: 构建
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建 H5 SSR 生产版本
RUN npm run build:h5:ssr

# ============================================
# 阶段 2: 生产运行
# ============================================
FROM node:18-alpine

WORKDIR /app

# 只复制生产依赖的 package 文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制构建产物
COPY --from=builder /app/dist/build/h5 ./dist/build/h5

# 创建非 root 用户
RUN addgroup -g node && adduser -g node node

# 改变目录所有者
RUN chown -R node:node /app

USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode ? 0 : 1)})"

# 启动 SSR 服务器（限制内存使用约 400MB）
CMD ["node", "--max-old-space-size=400", "dist/build/h5/server.js"]
