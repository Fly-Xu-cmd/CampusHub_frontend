# 阶段1: 构建 H5 SSR
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖描述文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci --legacy-peer-deps

# 复制项目代码
COPY . .

# 构建 H5 SSR
RUN npm run build:h5:ssr

# 阶段2: 运行服务 (减小镜像体积)
FROM node:18-alpine

WORKDIR /app

# 从构建阶段复制产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# 复制SSR服务器文件
COPY server.js ./

# 安装生产依赖 (不包括 devDependencies)
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["node", "server.js"]