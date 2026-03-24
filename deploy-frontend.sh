#!/bin/bash

# 前台部署脚本

echo "===== 开始部署前台 ====="

# 1. 构建
echo "[1/4] 构建前台项目..."
cd /Users/ligang/New/indigenex-website/frontend
npm run build

# 2. 打包
echo "[2/4] 打包代码..."
cd /Users/ligang/New/indigenex-website
tar czf frontend-deploy.tar.gz frontend/

# 3. 上传到服务器
echo "[3/4] 上传到服务器 (需要输入密码)..."
scp frontend-deploy.tar.gz root@47.236.193.197:/var/www/indigenex-website/

# 4. 在服务器上部署
echo "[4/4] 在服务器上部署 (需要输入密码)..."
ssh root@47.236.193.197 << 'REMOTE_COMMANDS'
cd /var/www/indigenex-website
rm -rf frontend-old
mv frontend frontend-old 2>/dev/null || true
tar xzf frontend-deploy.tar.gz
cd frontend
pm2 restart indigenex-frontend 2>/dev/null || pm2 start 'npm start' --name indigenex-frontend
echo "部署完成！"
REMOTE_COMMANDS

# 清理本地临时文件
rm -f frontend-deploy.tar.gz

echo "===== 部署完成 ====="
echo "访问地址: http://47.236.193.197/"
