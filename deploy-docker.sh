#!/bin/bash
set -e

echo "🚀 CampusHub H5 Docker 部署脚本（不使用 docker-compose 版）"
echo "========================================="

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker 未安装${NC}"
    echo -e "${YELLOW}请先安装 Docker${NC}"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ 错误: .env.production 文件不存在${NC}"
    echo -e "${YELLOW}请先创建 .env.production 文件并配置环境变量${NC}"
    exit 1
fi

# 加载环境变量
echo -e "${GREEN}📋 加载环境变量...${NC}"
export $(cat .env.production | grep -v '^#' | xargs)

# 验证必需的环境变量
required_vars=("VITE_BASE_URL" "VITE_WS_URL" "VITE_GEETEST_ID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ 错误: 环境变量 $var 未设置${NC}"
        exit 1
    fi
done

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export SCRIPT_DIR

# 额外的 Nginx 配置
export DOMAIN_NAME=${DOMAIN_NAME:-localhost}
export BACKEND_API_HOST=${VITE_BASE_URL}
export BACKEND_WS_HOST=${VITE_WS_URL}

echo -e "${GREEN}📋 配置信息:${NC}"
echo -e "  脚本目录: ${YELLOW}$SCRIPT_DIR${NC}"
echo -e "  域名/IP: ${YELLOW}$DOMAIN_NAME${NC}"
echo -e "  API: ${YELLOW}$VITE_BASE_URL${NC}"
echo -e "  WebSocket: ${YELLOW}$VITE_WS_URL${NC}"
echo ""

# 询问是否停止旧容器
echo -e "${YELLOW}是否停止旧容器? [y/N]:${NC}"
read -p " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🛑 停止旧容器...${NC}"
    docker stop campushub-h5 2>/dev/null || true
    docker stop campushub-nginx 2>/dev/null || true
    sleep 2
fi

# 创建网络（如果不存在）
echo -e "${GREEN}🌐 创建 Docker 网络...${NC}"
if ! docker network inspect campushub-network &> /dev/null; then
    docker network create campushub-network
fi

# 创建数据卷（如果不存在）
echo -e "${GREEN}📦 创建 Docker 数据卷...${NC}"
if ! docker volume inspect nginx-cache &> /dev/null; then
    docker volume create nginx-cache
fi
if ! docker volume inspect nginx-logs &> /dev/null; then
    docker volume create nginx-logs
fi

# 构建镜像
echo -e "${GREEN}🔨 构建 Docker 镜像...${NC}"
docker build -t campushub-h5:latest .

# 启动 Node.js 容器
echo -e "${GREEN}🚀 启动 Node.js 容器...${NC}"
docker run -d \
  --name campushub-h5 \
  --restart unless-stopped \
  --network campushub-network \
  -v $SCRIPT_DIR/dist/build/h5:/app \
  -v nginx-cache:/var/cache/nginx \
  --memory=768m \
  --cpus=0.5 \
  -e NODE_ENV=production \
  -e VITE_BASE_URL=${VITE_BASE_URL} \
  -e VITE_PROD_BASE_URL=${VITE_PROD_BASE_URL} \
  -e VITE_WS_URL=${VITE_WS_URL} \
  -e VITE_APP_NAME=${VITE_APP_NAME:-CampusHub} \
  -e VITE_APP_VERSION=${VITE_APP_VERSION:-1.0.0} \
  -e VITE_DEBUG=${VITE_DEBUG:-false} \
  -e VITE_GEETEST_ID=${VITE_GEETEST_ID} \
  node:18-alpine \
  node --max-old-space-size=400 dist/build/h5/server.js

# 等待 Node.js 启动
echo -e "${YELLOW}⏳ 等待 Node.js 启动...${NC}"
sleep 5

# 启动 Nginx 容器
echo -e "${GREEN}🚀 启动 Nginx 容器...${NC}"
docker run -d \
  --name campushub-nginx \
  --restart unless-stopped \
  --network campushub-network \
  -p 80:80 \
  -p 443:443 \
  -v $SCRIPT_DIR/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v nginx-cache:/var/cache/nginx:rw \
  -v nginx-logs:/var/log/nginx:rw \
  --link campushub-h5:app \
  --memory=128m \
  --cpus=0.25 \
  nginx:alpine

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
if docker ps | grep -q "campushub-h5.*Up" && docker ps | grep -q "campushub-nginx.*Up"; then
    echo -e "${GREEN}✅ 部署成功!${NC}"
    echo ""
    echo -e "${GREEN}📊 服务状态:${NC}"
    docker ps --filter "name=campushub-*"
    echo ""
    echo -e "${YELLOW}📝 常用命令:${NC}"
    echo "  查看日志: docker logs -f campushub-h5"
    echo "  查看日志: docker logs -f campushub-nginx"
    echo "  重启服务: docker restart campushub-h5"
    echo "  停止服务: docker stop campushub-h5 campushub-nginx"
    echo "  删除容器: docker rm campushub-h5 campushub-nginx"
    echo "  删除网络和数据卷: docker network rm campushub-network && docker volume rm nginx-cache nginx-logs"
    echo ""
    echo -e "${GREEN}🌐 访问地址: http://$DOMAIN_NAME${NC}"
else
    echo -e "${RED}❌ 部署失败，请检查日志${NC}"
    echo ""
    docker logs campushub-h5
    docker logs campushub-nginx
    exit 1
fi
