#!/bin/bash

echo "===== 配置 SSH 免密登录并部署 ====="
echo ""
echo "[步骤 1] 请输入服务器密码，配置 SSH 免密登录..."

# SSH 到服务器添加公钥
ssh -o StrictHostKeyChecking=no root@47.236.193.197 '
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCqAR5C+9o/C1riVEIBBUXI9fwgsyYVVmUyQ4YinnOwh2KhE5k3sTld42+zyGVxHJXXPJ9FX2b1NY8x+AX1kF1vlqkrs0wBjgG1yHQYlY0/Jj5hiXQM3aUNGb55kkq6DVDipxXbrVnwta/NKtsSp7iS/7FlS5O8W+M1FpP/9k/5Hr43yzYh4/is34ldrsh3aE1D4uj4engmhoM3JEdGH3/6JV4sxQ/eI+Q6bvK5km3aY7KbtzA6ghST7uoY8kBxP2wCC7fHiTg+vORiFxdSnijgZydzaTbuAGLuna9S17RMmGGsi3iXzgU+QGX1DqOVTREFfLBz2AXQKsd9gUd/Levn skp-t4n81gpwtwti66kkowj2" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
echo "SSH 公钥已添加"
'

echo ""
echo "[步骤 2] 测试免密登录..."
ssh -o PasswordAuthentication=no root@47.236.193.197 "echo '✅ 免密登录成功'" || {
    echo "❌ 免密登录失败，请检查密码是否正确"
    exit 1
}

echo ""
echo "[步骤 3] 部署前台..."

# 本地构建
cd /Users/ligang/New/indigenex-website/frontend
rm -rf .next
npm run build

# 打包（不含 node_modules）
cd /Users/ligang/New/indigenex-website
rm -f frontend-deploy.tar.gz
tar czf frontend-deploy.tar.gz frontend/ --exclude='node_modules' --exclude='.git'

# 上传并部署
scp frontend-deploy.tar.gz root@47.236.193.197:/var/www/indigenex-website/

ssh root@47.236.193.197 '
cd /var/www/indigenex-website
rm -rf frontend-old
mv frontend frontend-old 2>/dev/null || true
tar xzf frontend-deploy.tar.gz
cd frontend

echo "安装生产依赖..."
npm install --production 2>&1 | tail -3

echo "启动服务..."
pm2 stop indigenex-frontend 2>/dev/null || true
pm2 delete indigenex-frontend 2>/dev/null || true
PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
pm2 save

echo ""
echo "服务状态:"
pm2 status
'

rm -f frontend-deploy.tar.gz

echo ""
echo "===== 部署完成 ====="
echo "访问: http://47.236.193.197/"
