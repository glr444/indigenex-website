#!/bin/bash
# deploy.sh - 一键自动部署脚本（SSH密钥版）

set -e

SERVER="indigenex-server"
PROJECT_DIR="/var/www/indigenex-website"
LOCAL_DIR="/Users/ligang/New/indigenex-website"

echo "=== Carggo GM 自动部署 ==="
echo ""

# 1. 检查SSH连接
echo "[1/5] 检查SSH连接..."
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'OK'" > /dev/null 2>&1; then
    echo "❌ SSH连接失败，请检查:"
    echo "   1. ~/.ssh/deploy-key.pem 是否存在"
    echo "   2. ~/.ssh/config 是否配置正确"
    echo "   3. 阿里云密钥对已绑定并重启服务器"
    exit 1
fi
echo "✅ SSH连接正常"

# 2. 本地构建
echo ""
echo "[2/5] 本地构建前台..."
cd "$LOCAL_DIR/frontend"
rm -rf .next
npm run build > /dev/null 2>&1
echo "✅ 构建完成"

# 3. 同步到服务器
echo ""
echo "[3/5] 同步文件到服务器..."
cd "$LOCAL_DIR"
rsync -avz --delete -e "ssh" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    ./ "$SERVER:$PROJECT_DIR/" > /dev/null 2>&1
echo "✅ 同步完成"

# 4. 服务器端安装依赖并启动
echo ""
echo "[4/5] 服务器端配置..."
ssh "$SERVER" << 'REMOTE_EOF'
    set -e
    cd /var/www/indigenex-website/frontend

    # 设置权限
    chown -R root:root /var/www/indigenex-website 2>/dev/null || true

    # 安装生产依赖
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo "   安装依赖..."
        rm -rf node_modules
        npm install --production > /dev/null 2>&1
    fi

    # 重启服务
    echo "   启动服务..."
    pm2 delete indigenex-frontend 2>/dev/null || true
    PORT=3000 pm2 start npm --name "indigenex-frontend" -- start > /dev/null 2>&1
    pm2 save > /dev/null 2>&1

    # 等待服务启动
    sleep 3
REMOTE_EOF
echo "✅ 服务启动完成"

# 5. 验证
echo ""
echo "[5/5] 验证部署..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://47.236.193.197/ 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 部署成功！HTTP 200"
else
    echo "⚠️  状态码: $HTTP_CODE，请检查日志: ssh $SERVER 'pm2 logs'"
fi

echo ""
echo "=== 部署完成 ==="
echo "前台: http://47.236.193.197/"
echo "后台: http://47.236.193.197/admin"
echo ""
echo "管理命令:"
echo "  ssh $SERVER 'pm2 status'    # 查看状态"
echo "  ssh $SERVER 'pm2 logs'      # 查看日志"
echo "  ssh $SERVER 'pm2 restart indigenex-frontend'  # 重启"
