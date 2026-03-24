#!/bin/bash
# Indigenex 一键部署脚本
# 在阿里云轻量应用服务器上执行

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
API_KEY="${API_KEY:-}"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查root权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 权限运行此脚本"
        exit 1
    fi
}

# 系统更新
system_update() {
    print_info "更新系统..."
    apt update && apt upgrade -y
    apt install -y curl wget git vim nginx ufw software-properties-common
}

# 安装 Node.js
install_nodejs() {
    print_info "安装 Node.js 20..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    print_info "Node.js 版本: $(node -v)"
    print_info "NPM 版本: $(npm -v)"
}

# 安装 PM2
install_pm2() {
    print_info "安装 PM2..."
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        pm2 startup systemd
    fi
}

# 创建目录结构
create_directories() {
    print_info "创建项目目录..."
    mkdir -p /var/www/indigenex
    mkdir -p /var/backups/indigenex
    mkdir -p /var/www/html/admin
    mkdir -p /var/log/indigenex
}

# 部署后端
deploy_backend() {
    print_info "部署后端服务..."
    cd /var/www/indigenex/backend

    # 安装依赖
    npm ci --production

    # 生成生产环境变量
    if [ ! -f .env ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        MEMBER_JWT_SECRET=$(openssl rand -base64 32)
        ADMIN_PASSWORD=$(openssl rand -base64 12)

        cat > .env << EOF
# Database
DATABASE_URL="file:./prod.db"

# JWT Secret
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"

# Member JWT Secret
MEMBER_JWT_SECRET="$MEMBER_JWT_SECRET"
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
INITIAL_ADMIN_PASSWORD="$ADMIN_PASSWORD"
EOF

        print_warn "管理员密码已生成，请记录："
        echo "用户名: admin"
        echo "密码: $ADMIN_PASSWORD"
        echo ""
        echo "密码已保存到 /var/www/indigenex/backend/.env"
    fi

    # 初始化数据库
    npx prisma generate
    npx prisma migrate deploy

    # 启动服务
    pm2 delete indigenex-backend 2>/dev/null || true
    pm2 start server.js --name "indigenex-backend" --env production
    pm2 save
}

# 部署前台
deploy_frontend() {
    print_info "部署前台网站..."
    cd /var/www/indigenex/frontend

    # 安装依赖
    npm ci

    # 构建
    npm run build

    # 启动服务
    pm2 delete indigenex-frontend 2>/dev/null || true
    pm2 start "npm start" --name "indigenex-frontend"
    pm2 save
}

# 部署后台
deploy_admin() {
    print_info "部署管理后台..."
    cd /var/www/indigenex/admin

    # 安装依赖
    npm ci

    # 构建
    npm run build

    # 复制到 Nginx 目录
    cp -r dist/* /var/www/html/admin/
}

# 配置 Nginx
configure_nginx() {
    print_info "配置 Nginx..."

    # 等待用户输入域名
    if [ -z "$DOMAIN" ]; then
        read -p "请输入您的域名 (如: cargogm.com): " DOMAIN
    fi

    cat > /etc/nginx/sites-available/indigenex << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Admin Panel
    location /admin {
        alias /var/www/html/admin;
        try_files \$uri \$uri/ /admin/index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/indigenex/backend/uploads;
    }
}
EOF

    # 启用站点
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/indigenex /etc/nginx/sites-enabled/

    # 测试并重载
    nginx -t && systemctl reload nginx
}

# 配置防火墙
configure_firewall() {
    print_info "配置防火墙..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp      # SSH
    ufw allow 80/tcp      # HTTP
    ufw allow 443/tcp     # HTTPS
    ufw --force enable
}

# 配置 SSL
configure_ssl() {
    print_info "配置 SSL 证书..."

    if [ -z "$EMAIL" ]; then
        read -p "请输入您的邮箱 (用于SSL证书): " EMAIL
    fi

    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

    # 设置自动续期
    echo "0 2 * * * root certbot renew --quiet" | crontab -
}

# 设置备份
setup_backup() {
    print_info "设置自动备份..."

    cat > /usr/local/bin/backup-indigenex.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/indigenex"
DB_FILE="/var/www/indigenex/backend/prod.db"

# 备份数据库
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/db_$DATE.db"
    gzip "$BACKUP_DIR/db_$DATE.db"
fi

# 备份代码
cd /var/www
tar czf "$BACKUP_DIR/code_$DATE.tar.gz" indigenex --exclude='node_modules' --exclude='.git'

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "db_*.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "code_*.tar.gz" -mtime +30 -delete

echo "[$DATE] Backup completed"
EOF

    chmod +x /usr/local/bin/backup-indigenex.sh

    # 每天凌晨2点备份
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-indigenex.sh >> /var/log/indigenex/backup.log 2>&1") | crontab -
}

# 生成 API Key
generate_api_key() {
    print_info "生成 API Key..."

    API_KEY=$(openssl rand -hex 32)

    # 保存到文件
    echo "API_KEY=$API_KEY" > /var/www/indigenex/.api_key
    chmod 600 /var/www/indigenex/.api_key

    print_warn "请记录以下 API Key，用于 Open Claw AI 对接："
    echo ""
    echo "===================================="
    echo "API Key: $API_KEY"
    echo "===================================="
    echo ""
    echo "已保存到 /var/www/indigenex/.api_key"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}部署完成！${NC}"
    echo "=============================================="
    echo ""
    echo "访问地址："
    echo "  前台网站: https://$DOMAIN"
    echo "  管理后台: https://$DOMAIN/admin"
    echo "  API 接口: https://$DOMAIN/api"
    echo ""
    echo "管理员账号："
    echo "  用户名: admin"
    echo "  密码: 查看 /var/www/indigenex/backend/.env"
    echo ""
    echo "API Key："
    echo "  查看 /var/www/indigenex/.api_key"
    echo ""
    echo "常用命令："
    echo "  pm2 status          # 查看服务状态"
    echo "  pm2 logs            # 查看日志"
    echo "  nginx -t            # 测试 Nginx 配置"
    echo ""
    echo "备份目录："
    echo "  /var/backups/indigenex"
    echo "=============================================="
}

# 主函数
main() {
    echo "=============================================="
    echo "  Indigenex 网站生产环境部署脚本"
    echo "=============================================="
    echo ""

    check_root
    system_update
    install_nodejs
    install_pm2
    create_directories

    # 检查代码是否存在
    if [ ! -d "/var/www/indigenex/backend" ]; then
        print_error "未找到项目代码，请先上传代码到 /var/www/indigenex"
        echo ""
        echo "上传方式："
        echo "  1. git clone https://github.com/your-repo/indigenex-website.git /var/www/indigenex"
        echo "  2. 或 scp -r indigenex-website root@your-server:/var/www/"
        exit 1
    fi

    deploy_backend
    deploy_frontend
    deploy_admin
    configure_nginx
    configure_firewall
    configure_ssl
    setup_backup
    generate_api_key

    show_deployment_info
}

# 运行主函数
main
