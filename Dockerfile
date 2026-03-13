# 运行服务 (H5 SSR)
FROM node:18-alpine

WORKDIR /app

# 复制依赖和代码
COPY package.json package-lock.json* ./
COPY server.js ./
COPY dist/build/h5 ./dist

# 安装生产依赖
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["node", "server.js"]