# Indigenex 网站生产部署文档

> 完整的生产环境部署指南，适用于阿里云轻量应用服务器

---

## 一、服务器环境要求

| 配置项 | 要求 |
|--------|------|
| 服务器 | 阿里云轻量应用服务器 1核2G |
| 操作系统 | Ubuntu 22.04 LTS |
| 域名 | 已备案域名（如：cargogm.com） |
| 备案 | 已完成ICP备案 |

---

## 二、服务器初始化

### 2.1 连接服务器

```bash
# 使用 SSH 连接到服务器
ssh root@your-server-ip
```

### 2.2 系统更新

```bash
# 更新系统
apt update && apt upgrade -y

# 安装基础工具
apt install -y curl wget git vim nginx
```

### 2.3 安装 Node.js 20

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 2.4 安装 PM2

```bash
# 安装 PM2 进程管理器
npm install -g pm2

# 设置 PM2 开机自启
pm2 startup systemd
```

---

## 三、项目部署

### 3.1 创建项目目录

```bash
mkdir -p /var/www/indigenex
cd /var/www/indigenex
```

### 3.2 上传代码

**方式一：使用 Git**

```bash
git clone https://github.com/your-repo/indigenex-website.git .
```

**方式二：使用 SCP（本地执行）**

```bash
# 从本地打包上传
tar czvf indigenex-website.tar.gz --exclude='node_modules' --exclude='.git' indigenex-website/

# 上传到服务器
scp indigenex-website.tar.gz root@your-server-ip:/var/www/

# 在服务器解压
ssh root@your-server-ip "cd /var/www && tar xzvf indigenex-website.tar.gz && mv indigenex-website indigenex"
```

### 3.3 后端部署

```bash
cd /var/www/indigenex/backend

# 安装依赖
npm ci --production

# 创建生产环境变量
cat > .env << 'EOF'
# Database - MySQL Docker
DATABASE_URL="mysql://root:your_secure_password@localhost:3306/indigenex"

# JWT Secret - 生产环境必须修改！
JWT_SECRET="your-production-jwt-secret-$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# Member JWT Secret
MEMBER_JWT_SECRET="member-$(openssl rand -base64 32)"
MEMBER_JWT_EXPIRES_IN="7d"

# WeChat Open Platform
WECHAT_APP_ID=""
WECHAT_APP_SECRET=""

# Dazhanggui API Config
DZG_APP_KEY="ligang"
DZG_APP_SECRET="4b213ca8eda0491da9b13e9deb6f6668"
DZG_BASE_URL="https://api.800jit.com/openplatform-rest/rest/api"

# SMTP Config
SMTP_HOST=""
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM_NAME="Indigenex"
SMTP_FROM_EMAIL=""

# Server
PORT=5001
NODE_ENV=production

# Initial Admin
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="$(openssl rand -base64 12)"
EOF

# 初始化数据库
npx prisma generate
npx prisma migrate deploy

# 启动服务
pm2 start server.js --name "indigenex-backend" --env production
pm2 save
```

**记录生成的管理员密码：**

```bash
grep INITIAL_ADMIN_PASSWORD /var/www/indigenex/backend/.env
```

### 3.4 前台部署

```bash
cd /var/www/indigenex/frontend

# 安装依赖
npm ci

# 构建
npm run build

# 使用 PM2 托管 Next.js
pm2 start "npm start" --name "indigenex-frontend"
pm2 save
```

### 3.5 后台部署

```bash
cd /var/www/indigenex/admin

# 安装依赖
npm ci

# 修改 vite.config.ts 生产配置
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    host: true,
  }
})
EOF

# 构建
npm run build

# 复制到 Nginx 目录
cp -r dist/* /var/www/html/admin/
```

---

## 四、Nginx 配置

### 4.1 创建站点配置

```bash
cat > /etc/nginx/sites-available/indigenex << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前台网站
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 后台管理
    location /admin {
        alias /var/www/html/admin;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 接口
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件
    location /uploads {
        alias /var/www/indigenex/backend/uploads;
    }
}
EOF

# 启用站点
ln -s /etc/nginx/sites-available/indigenex /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重载 Nginx
nginx -t
systemctl reload nginx
```

### 4.2 配置 HTTPS（SSL）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
certbot renew --dry-run
```

---

## 五、防火墙配置

```bash
# 开放必要端口
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 5001/tcp    # Backend API（如需直接访问）

# 启用防火墙
ufw enable
```

---

## 六、服务管理

### 6.1 PM2 管理命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs indigenex-backend
pm2 logs indigenex-frontend

# 重启服务
pm2 restart indigenex-backend
pm2 restart indigenex-frontend

# 停止服务
pm2 stop indigenex-backend

# 删除服务
pm2 delete indigenex-backend
```

### 6.2 Nginx 管理命令

```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx
```

---

## 七、备份与恢复

### 7.1 数据库备份 (MySQL Docker)

```bash
# 创建备份目录
mkdir -p /var/backups/indigenex

# 备份脚本
cat > /usr/local/bin/backup-indigenex.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/indigenex"
MYSQL_PASSWORD="your_secure_password"

# 使用 Docker 执行 mysqldump
docker exec indigenex-mysql mysqldump -u root -p$MYSQL_PASSWORD indigenex > "$BACKUP_DIR/db_$DATE.sql"

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "db_*.sql" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql"
EOF

chmod +x /usr/local/bin/backup-indigenex.sh

# 设置定时任务（每天凌晨2点备份）
echo "0 2 * * * root /usr/local/bin/backup-indigenex.sh" > /etc/cron.d/indigenex-backup
```

### 7.2 代码备份

```bash
# 打包备份代码
tar czvf /var/backups/indigenex/code_$(date +%Y%m%d).tar.gz -C /var/www indigenex
```

---

## 八、监控与日志

### 8.1 查看日志

```bash
# 后端日志
pm2 logs indigenex-backend

# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u nginx -f
```

### 8.2 设置日志轮转

```bash
cat > /etc/logrotate.d/indigenex << 'EOF'
/var/www/indigenex/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF
```

---

## 九、故障排查

### 9.1 服务无法启动

```bash
# 检查端口占用
netstat -tlnp | grep 3000
netstat -tlnp | grep 5001

# 检查进程
ps aux | grep node

# 检查 PM2 日志
pm2 logs
```

### 9.2 数据库问题

```bash
cd /var/www/indigenex/backend

# 重置数据库（谨慎使用！）
npx prisma migrate reset

# 查看数据库（使用 Docker 内的 MySQL 客户端）
docker exec -it indigenex-mysql mysql -u root -p -e "USE indigenex; SHOW TABLES;"
docker exec -it indigenex-mysql mysql -u root -p -e "USE indigenex; SELECT * FROM User LIMIT 5;"
```

### 9.3 权限问题

```bash
# 修复文件权限
chown -R www-data:www-data /var/www/indigenex
chmod -R 755 /var/www/indigenex
```

---

## 十、更新部署

### 10.1 代码更新

```bash
cd /var/www/indigenex

# 拉取最新代码
git pull origin main

# 后端更新
cd backend
npm ci --production
npx prisma migrate deploy
pm2 restart indigenex-backend

# 前台更新
cd ../frontend
npm ci
npm run build
pm2 restart indigenex-frontend

# 后台更新
cd ../admin
npm ci
npm run build
cp -r dist/* /var/www/html/admin/
```

### 10.2 快速热更新脚本

```bash
cat > /usr/local/bin/deploy-update.sh << 'EOF'
#!/bin/bash
cd /var/www/indigenex

echo "Pulling latest code..."
git pull origin main

echo "Updating backend..."
cd backend
npm ci --production
npx prisma migrate deploy
pm2 restart indigenex-backend

echo "Updating frontend..."
cd ../frontend
npm ci
npm run build
pm2 restart indigenex-frontend

echo "Updating admin..."
cd ../admin
npm ci
npm run build
cp -r dist/* /var/www/html/admin/

echo "Deployment completed!"
EOF

chmod +x /usr/local/bin/deploy-update.sh
```

---

## 十一、安全加固

### 11.1 SSH 安全

```bash
# 编辑 SSH 配置
vim /etc/ssh/sshd_config

# 修改以下配置
PermitRootLogin no          # 禁止 root 登录
PasswordAuthentication no    # 禁用密码登录（使用密钥）
MaxAuthTries 3              # 最大尝试次数

# 重启 SSH
systemctl restart sshd
```

### 11.2 fail2ban 防暴力破解

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 十二、访问地址

部署完成后，可通过以下地址访问：

| 服务 | 地址 |
|------|------|
| 前台网站 | https://your-domain.com |
| 管理后台 | https://your-domain.com/admin |
| API 接口 | https://your-domain.com/api |

**默认管理员账号：**
- 用户名：admin
- 密码：（查看 .env 文件中的 INITIAL_ADMIN_PASSWORD）

---

## 附录：一键部署脚本

将以下内容保存为 `deploy.sh`，在服务器上执行：

```bash
#!/bin/bash
set -e

echo "=== Indigenex Production Deployment ==="

# 配置
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"

# 更新系统
apt update && apt upgrade -y

# 安装依赖
apt install -y curl wget git vim nginx ufw

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 PM2
npm install -g pm2

# 创建目录
mkdir -p /var/www/indigenex /var/backups/indigenex

# 提示手动上传代码
echo ""
echo "请上传代码到 /var/www/indigenex"
echo "然后继续执行后续步骤..."
```

---

**文档版本**: v1.0
**最后更新**: 2026-03-24
**维护者**: [Your Name]
