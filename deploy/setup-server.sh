#!/bin/bash
# 服务器环境配置脚本 - 初始化后端环境

set -e

echo "=============================================="
echo "  服务器环境配置"
echo "=============================================="
echo ""

SERVER_IP="47.236.193.197"
BACKEND_DIR="/var/www/indigenex-website/backend"

echo "[1/3] 创建后端 .env 文件..."
mkdir -p "$BACKEND_DIR"
cat > "$BACKEND_DIR/.env" << EOF
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Member JWT Secret
MEMBER_JWT_SECRET="member-jwt-secret-change-this-in-production"
MEMBER_JWT_EXPIRES_IN="7d"

# WeChat Open Platform (for QR code login)
WECHAT_APP_ID="your_wechat_app_id"
WECHAT_APP_SECRET="your_wechat_app_secret"

# Dazhanggui API Config
DZG_APP_KEY="ligang"
DZG_APP_SECRET="4b213ca8eda0491da9b13e9deb6f6668"
DZG_BASE_URL="https://api.800jit.com/openplatform-rest/rest/api"

# SMTP Config (for member approval emails)
SMTP_HOST="smtp.example.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="noreply@example.com"
SMTP_PASS="your-smtp-password"
SMTP_FROM_NAME="Indigenex Business Portal"
SMTP_FROM_EMAIL="noreply@example.com"

# Server
PORT=5001
NODE_ENV=production

# Initial Admin
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="Ab1234567"
EOF

echo "[2/3] 安装后端依赖..."
cd "$BACKEND_DIR"
npm ci --production 2>&1 | tail -10

echo "[3/3] 初始化 Prisma..."
npx prisma generate 2>&1 | tail -5

# 检查数据库文件是否存在，如果不存在则提示
if [ ! -f "$BACKEND_DIR/dev.db" ]; then
    echo ""
    echo "⚠️ 警告: 数据库文件 dev.db 不存在"
    echo "   如果需要初始化数据库，请运行:"
    echo "   cd $BACKEND_DIR && npx prisma db push"
    echo "   或者恢复数据库备份"
fi

echo ""
echo "=============================================="
echo "  ✅ 服务器环境配置完成！"
echo "=============================================="
echo ""
echo "下一步:"
echo "  1. 如果使用 systemd，重启服务:"
echo "     systemctl restart indigenex-backend"
echo ""
echo "  2. 如果使用 PM2，重启服务:"
echo "     pm2 restart indigenex-backend"
echo ""
echo "  3. 检查服务状态:"
echo "     curl http://localhost:5001/health"
echo "=============================================="
