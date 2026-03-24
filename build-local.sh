#!/bin/bash
# 本地构建脚本 - 零服务器资源部署
# 所有构建在本地完成，服务器只解压

set -e

echo "=============================================="
echo "  本地构建脚本 (零服务器资源部署)"
echo "=============================================="
echo ""

BASE_DIR="/Users/ligang/New/indigenex-website"
DEPLOY_DIR="$BASE_DIR/deploy"

echo "[1/7] 清理旧构建..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "[2/7] 构建前台 (Next.js)..."
cd "$BASE_DIR/frontend"
rm -rf dist .next
npm run build 2>&1 | tail -20
# Next.js output is in 'dist' folder as configured in next.config.js
cp -r dist "$DEPLOY_DIR/frontend"

echo "[3/7] 构建后台管理 (Vite)..."
cd "$BASE_DIR/admin"
rm -rf dist
npm run build 2>&1 | tail -10
cp -r dist "$DEPLOY_DIR/admin"

echo "[4/7] 准备后端..."
cd "$BASE_DIR/backend"
mkdir -p "$DEPLOY_DIR/backend"
cp -r src package.json package-lock.json prisma server.js "$DEPLOY_DIR/backend/"
# 复制数据库文件(如果存在)
if [ -f "dev.db" ]; then
    cp dev.db "$DEPLOY_DIR/backend/"
    echo "  ✓ 已复制数据库文件"
fi

echo "[5/7] 复制配置文件..."
cp "$BASE_DIR/nginx-config" "$DEPLOY_DIR/"
cp "$BASE_DIR/setup-server.sh" "$DEPLOY_DIR/"

echo "[6/7] 打包部署文件..."
cd "$DEPLOY_DIR"
tar czvf indigenex-release.tar.gz frontend/ admin/ backend/ nginx-config setup-server.sh
ls -lh indigenex-release.tar.gz

echo "[7/7] 创建服务器部署脚本..."
cat > "$DEPLOY_DIR/deploy-server.sh" << 'SERVER_SCRIPT'
#!/bin/bash
# 服务器端部署脚本 - 零编译，仅解压

set -e

echo "=============================================="
echo "  服务器部署脚本"
echo "=============================================="
echo ""

# 设置变量
DEPLOY_ROOT="/var/www/indigenex-website"
BACKUP_DIR="/var/www/backup-$(date +%Y%m%d-%H%M%S)"

echo "[1/6] 备份当前版本..."
if [ -d "$DEPLOY_ROOT" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_ROOT" "$BACKUP_DIR/" 2>/dev/null || true
    echo "  ✓ 备份已保存到: $BACKUP_DIR"
else
    echo "  (无现有版本需要备份)"
fi

echo "[2/6] 停止服务..."
pm2 stop indigenex-backend 2>/dev/null || true
pm2 stop indigenex-frontend 2>/dev/null || true

echo "[3/6] 创建部署目录..."
rm -rf "$DEPLOY_ROOT"
mkdir -p "$DEPLOY_ROOT"

echo "[4/6] 解压新版本..."
tar xzvf /tmp/indigenex-release.tar.gz -C "$DEPLOY_ROOT"
echo "  ✓ 文件已解压到: $DEPLOY_ROOT"

echo "[5/6] 配置后端环境..."
cd "$DEPLOY_ROOT/backend"

# 创建 .env 文件(如果不存在)
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="prod-jwt-secret-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Member JWT Secret
MEMBER_JWT_SECRET="prod-member-jwt-secret-$(date +%s)"
MEMBER_JWT_EXPIRES_IN="7d"

# Server
PORT=5001
NODE_ENV=production

# Initial Admin
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="Ab1234567"
EOF
    echo "  ✓ 已创建 .env 文件"
fi

echo "[6/6] 安装后端依赖..."
npm ci --production 2>&1 | tail -10
npx prisma generate 2>&1 | tail -5

echo ""
echo "=============================================="
echo "  ✅ 部署完成！"
echo "=============================================="
echo ""
echo "📂 部署目录: $DEPLOY_ROOT"
echo ""
echo "📋 下一步操作:"
echo ""
echo "  1. 配置 Nginx:"
echo "     cp $DEPLOY_ROOT/nginx-config /etc/nginx/sites-available/indigenex"
echo "     ln -sf /etc/nginx/sites-available/indigenex /etc/nginx/sites-enabled/"
echo "     nginx -t && systemctl reload nginx"
echo ""
echo "  2. 启动后端服务:"
echo "     cd $DEPLOY_ROOT/backend"
echo "     pm2 start server.js --name indigenex-backend"
echo ""
echo "  3. 检查服务状态:"
echo "     curl http://localhost:5001/health"
echo ""
echo "  4. 访问网站:"
echo "     http://47.236.193.197"
echo ""
echo "💡 如果需要初始化数据库:"
echo "     cd $DEPLOY_ROOT/backend && npx prisma db push"
echo "=============================================="
SERVER_SCRIPT

chmod +x "$DEPLOY_DIR/deploy-server.sh"

echo ""
echo "=============================================="
echo "  ✅ 本地构建完成！"
echo "=============================================="
echo ""
echo "📦 部署包: $DEPLOY_DIR/indigenex-release.tar.gz"
echo "📄 部署脚本: $DEPLOY_DIR/deploy-server.sh"
echo ""
echo "📋 部署步骤:"
echo ""
echo "  1. 上传部署包到服务器:"
echo "     scp $DEPLOY_DIR/indigenex-release.tar.gz root@47.236.193.197:/tmp/"
echo ""
echo "  2. 执行服务器部署:"
echo "     ssh root@47.236.193.197 'bash -s' < $DEPLOY_DIR/deploy-server.sh"
echo ""
echo "  3. 登录服务器完成后续配置:"
echo "     ssh root@47.236.193.197"
echo ""
echo "=============================================="
