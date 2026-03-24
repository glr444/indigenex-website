#!/bin/bash

echo "===== 修复前台服务 ====="

cd /var/www/indigenex-website/frontend

echo "[1/5] 停止现有服务..."
pm2 stop indigenex-frontend 2>/dev/null || true
pm2 delete indigenex-frontend 2>/dev/null || true

echo "[2/5] 安装依赖..."
npm install

echo "[3/5] 检查构建文件..."
if [ ! -d ".next" ]; then
  echo "❌ 缺少构建文件，开始构建..."
  npm run build
else
  echo "✅ 构建文件存在"
fi

echo "[4/5] 启动服务..."
PM2_HOME=/root/.pm2 pm2 start npm --name "indigenex-frontend" -- start

echo "[5/5] 保存 PM2 配置..."
pm2 save

echo ""
echo "===== 服务状态 ====="
pm2 status

echo ""
echo "如果仍显示 errored，请运行查看日志："
echo "pm2 logs indigenex-frontend --lines 50"
