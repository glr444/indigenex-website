#!/bin/bash

# 完整部署并修复脚本

echo "===== 前台部署+修复 ====="

cd /Users/ligang/New/indigenex-website

echo "[1/6] 清理旧构建..."
cd frontend && rm -rf .next && cd ..

echo "[2/6] 重新构建..."
cd frontend && npm run build && cd ..

echo "[3/6] 打包..."
tar czf frontend-deploy.tar.gz frontend/

echo "[4/6] 上传到服务器..."
echo "请输入服务器密码："
scp frontend-deploy.tar.gz root@47.236.193.197:/var/www/indigenex-website/

echo "[5/6] 在服务器上部署并修复..."
echo "请输入服务器密码："
ssh root@47.236.193.197 '
set -e
cd /var/www/indigenex-website
echo "解压文件..."
rm -rf frontend-old
mv frontend frontend-old 2>/dev/null || true
tar xzf frontend-deploy.tar.gz
cd frontend
echo "安装依赖..."
npm install 2>&1 | tail -5
echo "停止旧服务..."
pm2 stop indigenex-frontend 2>/dev/null || true
pm2 delete indigenex-frontend 2>/dev/null || true
echo "启动服务..."
PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
echo "保存配置..."
pm2 save
echo "状态检查："
pm2 status
'

echo "[6/6] 清理本地文件..."
rm -f frontend-deploy.tar.gz

echo ""
echo "===== 部署完成 ====="
echo "访问: http://47.236.193.197/"
