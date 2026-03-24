#!/bin/bash

echo "===== 快速部署（本地构建）====="

cd /Users/ligang/New/indigenex-website/frontend

echo "[1/3] 本地清理并重新构建..."
rm -rf .next node_modules package-lock.json
npm install
npm run build

echo "[2/3] 打包（不包含 node_modules）..."
cd /Users/ligang/New/indigenex-website
rm -f frontend-quick.tar.gz
tar czf frontend-quick.tar.gz frontend/ --exclude='frontend/node_modules' --exclude='frontend/.git'

echo "[3/3] 上传并部署..."
scp frontend-quick.tar.gz root@47.236.193.197:/var/www/indigenex-website/

ssh root@47.236.193.197 '
cd /var/www/indigenex-website
rm -rf frontend-old
mv frontend frontend-old 2>/dev/null || true
tar xzf frontend-quick.tar.gz
cd frontend
echo "安装生产依赖..."
npm install --production --omit=dev
pm2 stop indigenex-frontend 2>/dev/null || true
pm2 delete indigenex-frontend 2>/dev/null || true
PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
pm2 save
pm2 status
'

rm -f frontend-quick.tar.gz
echo "完成！"
