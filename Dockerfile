FROM node:18-alpine

WORKDIR /app

# 1. 复制依赖描述文件
COPY package.json .

# 2. 安装依赖 (关键修改：不加 --production，确保 overrides 生效，并强制清理缓存)
RUN npm install --legacy-peer-deps && npm cache clean --force

# 3. 复制项目代码
COPY dist ./dist
COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]