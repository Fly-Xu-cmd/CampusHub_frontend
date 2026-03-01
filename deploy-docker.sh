#!/bin/bash
set -e

# =================================================================
# 🚀 CampusHub H5 Docker 部署脚本 (修复版)
# =================================================================

# 定义颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 初始化部署脚本...${NC}"

# 1. 动态获取脚本所在目录 (兼容性更强)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export SCRIPT_DIR

# 2. 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker 未安装${NC}"
    exit 1
fi

# 3. 加载环境变量 (关键修复)
ENV_FILE="$SCRIPT_DIR/.env.production"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}📋 加载环境变量文件: .env.production${NC}"
    # 使用 set -a 自动导出变量
    set -a
    source "$ENV_FILE"
    set +a
else
    echo -e "${RED}❌ 错误: $ENV_FILE 文件不存在${NC}"
    exit 1
fi

# 4. 验证关键变量
if [ -z "$VITE_GEETEST_ID" ]; then
    echo -e "${RED}❌ 错误: 环境变量 VITE_GEETEST_ID 未读取到，请检查 .env.production 文件格式${NC}"
    exit 1
fi

echo -e "${GREEN}📋 配置信息:${NC}"
echo -e "  工作目录: ${YELLOW}$SCRIPT_DIR${NC}"
echo -e "  运行用户: ${YELLOW}$(whoami)${NC}"
echo -e "  App 版本: ${YELLOW}${VITE_APP_VERSION:-1.0.0}${NC}"
echo ""

# 5. 交互确认 (修复 read 语法)
echo -e "${YELLOW}是否开始部署? [y/N]: ${NC}"
read -n 1 -r
echo # 换行
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚫 操作已取消${NC}"
    exit 1
fi

# 6. 清理旧容器
echo -e "${YELLOW}🛑 清理旧容器...${NC}"
# 只停止 h5 容器，不停止 nginx (除非你也打算重启 nginx)
docker stop campushub-h5 2>/dev/null || true
docker rm campushub-h5 2>/dev/null || true

# 7. 准备网络和卷
echo -e "${GREEN}🌐 检查 Docker 网络与数据卷...${NC}"
docker network inspect campushub-network &> /dev/null || docker network create campushub-network
docker volume inspect nginx-cache &> /dev/null || docker volume create nginx-cache
docker volume inspect nginx-logs &> /dev/null || docker volume create nginx-logs

# 8. 构建镜像 (关键修复：参数顺序)
echo -e "${GREEN}🔨 构建 Docker 镜像...${NC}"
# 注意：这里假设 Dockerfile 在 SCRIPT_DIR 目录下
docker build -t campushub-h5:latest "$SCRIPT_DIR"

# 9. 启动容器
echo -e "${GREEN}🚀 启动 Node.js 容器...${NC}"
docker run -d \
  --name campushub-h5 \
  --restart unless-stopped \
  --network campushub-network \
  -v nginx-cache:/var/cache/nginx \
  -v nginx-logs:/var/log/nginx:rw \
  -e NODE_ENV=production \
  -e VITE_BASE_URL="${VITE_BASE_URL}" \
  -e VITE_PROD_BASE_URL="${VITE_PROD_BASE_URL}" \
  -e VITE_WS_URL="${VITE_WS_URL}" \
  -e VITE_APP_NAME="${VITE_APP_NAME:-CampusHub}" \
  -e VITE_APP_VERSION="${VITE_APP_VERSION:-1.0.0}" \
  -e VITE_DEBUG="${VITE_DEBUG:-false}" \
  -e VITE_GEETEST_ID="${VITE_GEETEST_ID}" \
  --memory=768m \
  --cpus=0.5 \
  campushub-h5:latest
  /bin/sh -c "cd /app && node server.js"

# 10. 健康检查
echo -e "${YELLOW}⏳ 等待服务启动 (5秒)...${NC}"
sleep 5

if docker ps | grep -q "campushub-h5.*Up"; then
    echo -e "${GREEN}✅ 部署成功!${NC}"
    echo -e "${GREEN}📊 容器状态:${NC}"
    docker ps --filter "name=campushub-h5"
    echo ""
    echo -e "${GREEN}💡 提示: 请确保 Nginx 容器已启动并反向代理至 campushub-h5${NC}"
else
    echo -e "${RED}❌ 部署失败，容器未启动。查看日志:${NC}"
    docker logs campushub-h5
    exit 1
fi