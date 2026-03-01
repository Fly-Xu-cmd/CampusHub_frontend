#!/bin/bash
set -e

echo "🚀 CampusHub H5 Docker 部署脚本（内网服务器版）"
echo "=========================================="

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker 未安装${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker Compose 未安装${NC}"
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

# 额外的 Nginx 配置
export DOMAIN_NAME=${DOMAIN_NAME:-localhost}
export BACKEND_API_HOST=${VITE_BASE_URL}
export BACKEND_WS_HOST=${VITE_WS_URL}

echo -e "${GREEN}📋 配置信息:${NC}"
echo -e "  域名/IP: ${YELLOW}$DOMAIN_NAME${NC}"
echo -e "  API: ${YELLOW}$VITE_BASE_URL${NC}"
echo -e "  WebSocket: ${YELLOW}$VITE_WS_URL${NC}"

# 询问是否停止旧容器
echo ""
read -p "是否停止旧容器? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🛑 停止旧容器...${NC}"
    docker-compose down
fi

# 构建镜像
echo -e "${GREEN}🔨 构建 Docker 镜像...${NC}"
docker-compose build

# 启动服务
echo -e "${GREEN}🚀 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 部署成功!${NC}"
    echo ""
    echo -e "${GREEN}📊 服务状态:${NC}"
    docker-compose ps
    echo ""
    echo -e "${YELLOW}📝 常用命令:${NC}"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo ""
    echo -e "${GREEN}🌐 访问地址: http://$DOMAIN_NAME${NC}"
else
    echo -e "${RED}❌ 部署失败，请检查日志${NC}"
    docker-compose logs
    exit 1
fi
