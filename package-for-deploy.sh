#!/bin/bash
# 本地打包脚本 - 在本地执行，准备上传到服务器

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$PROJECT_DIR/deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="indigenex-deploy-$TIMESTAMP.tar.gz"

echo "=============================================="
echo "  Indigenex 部署打包工具"
echo "=============================================="
echo ""

# 清理旧的构建
echo "[1/5] 清理旧的构建..."
cd "$PROJECT_DIR/frontend"
rm -rf .next out

cd "$PROJECT_DIR/admin"
rm -rf dist

cd "$PROJECT_DIR/backend"
rm -rf node_modules/prisma/*.db

# 前台构建
echo "[2/5] 构建前台 (Next.js)..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# 后台构建
echo "[3/5] 构建后台 (Vite)..."
cd "$PROJECT_DIR/admin"
npm ci
npm run build

# 后端依赖安装
echo "[4/5] 安装后端依赖..."
cd "$PROJECT_DIR/backend"
npm ci --production
npx prisma generate

# 创建部署包
echo "[5/5] 创建部署包..."
mkdir -p "$DEPLOY_DIR"

cd "$PROJECT_DIR"

# 打包项目（排除不需要的文件）
tar czf "$DEPLOY_DIR/$PACKAGE_NAME" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    --exclude='deploy/*.tar.gz' \
    --exclude='frontend/node_modules' \
    --exclude='admin/node_modules' \
    --exclude='backend/node_modules' \
    --exclude='backend/dev.db' \
    --exclude='backend/*.db-journal' \
    --exclude='frontend/.env.local' \
    --exclude='backend/.env' \
    --exclude='admin/dist' \
    --exclude='frontend/out' \
    frontend/ admin/ backend/ \
    docker-compose.yml \
    PRODUCTION_DEPLOYMENT.md \
    deploy-to-production.sh \
    admin/API_DOCUMENTATION.md \
    admin/OPEN_CLAW_CONFIG.json

# 复制部署脚本到 deploy 目录
cp deploy-to-production.sh "$DEPLOY_DIR/"

echo ""
echo "=============================================="
echo "  打包完成！"
echo "=============================================="
echo ""
echo "部署包: $DEPLOY_DIR/$PACKAGE_NAME"
echo "部署脚本: $DEPLOY_DIR/deploy-to-production.sh"
echo ""
echo "上传命令:"
echo "  scp $DEPLOY_DIR/$PACKAGE_NAME root@your-server-ip:/var/www/"
echo "  scp $DEPLOY_DIR/deploy-to-production.sh root@your-server-ip:/var/www/"
echo ""
echo "然后在服务器上执行:"
echo "  ssh root@your-server-ip"
echo "  cd /var/www && tar xzvf $PACKAGE_NAME"
echo "  mv indigenex-deploy-$TIMESTAMP indigenex"
echo "  cd indigenex && chmod +x deploy-to-production.sh && ./deploy-to-production.sh"
echo "=============================================="
