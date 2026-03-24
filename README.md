# Indigenex Logistics Website

完整的企业官网系统，包含前台展示和后台管理功能。

## 项目结构

```
indigenex-website/
├── backend/          # Node.js + Express + Prisma 后端 API
├── frontend/         # Next.js 前端网站
└── admin/            # React 后台管理系统
```

## 功能特性

### 前台网站 (Frontend)
- 首页 - Hero展示、服务卡片、关于预览、数据统计
- 关于页 - 公司使命、50+年经验、能力网格、价值观
- 服务页 - 空/海/陆/铁四种货运服务 + 专业方案
- 国家/合作伙伴页 - 全球网络地图 + 区域合作伙伴
- 联系页 - 联系表单 + 联系信息 + FAQ
- 新闻公告 - 展示后台发布的新闻内容

### 后台管理 (Admin)
- 用户登录认证 (JWT)
- 强制首次登录修改密码
- 新闻管理 - 增删改查、发布/草稿状态
- 联系信息管理 - 查看提交的联系表单、标记已读/未读
- 密码安全 - bcrypt加密存储

## 技术栈

### 后端
- Node.js 18+
- Express.js
- Prisma ORM
- PostgreSQL
- JWT 认证
- bcryptjs 密码加密

### 前端
- Next.js 14
- React 18
- Tailwind CSS
- Lucide Icons

### 后台
- React 18
- Vite
- React Router 6
- Tailwind CSS
- Axios

## 快速开始

### 1. 数据库设置

```bash
# 安装 PostgreSQL，创建数据库
createdb indigenex_db

# 或在 psql 中
CREATE DATABASE indigenex_db;
```

### 2. 后端启动

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
# 编辑 .env 文件，设置 DATABASE_URL

# 初始化数据库
npx prisma migrate dev --name init
npx prisma generate

# 创建初始管理员账号
npm run db:seed

# 启动开发服务器
npm run dev
```

后端运行在 http://localhost:5000

### 3. 前台启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前台运行在 http://localhost:3000

### 4. 后台启动

```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后台运行在 http://localhost:3001

## 默认登录凭证

- 用户名: `admin`
- 密码: `Ab1234567`

首次登录后需要修改为符合安全要求的密码。

## 部署到阿里云

### 环境要求
- Ubuntu 20.04+ / CentOS 7+
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2

### 部署步骤

1. **服务器准备**
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install nginx
```

2. **数据库配置**
```bash
sudo -u postgres psql
cREATE USER indigenex WITH PASSWORD 'your_secure_password';
CREATE DATABASE indigenex_db OWNER indigenex;
GRANT ALL PRIVILEGES ON DATABASE indigenex_db TO indigenex;
\q
```

3. **项目部署**
```bash
# 复制项目到服务器
rsync -avz --exclude 'node_modules' . user@your-server:/var/www/indigenex/

# 安装依赖并构建
cd /var/www/indigenex/backend
npm install
npm run db:migrate
npm run db:seed

cd /var/www/indigenex/frontend
npm install
npm run build

cd /var/www/indigenex/admin
npm install
npm run build
```

4. **PM2 进程管理**
```bash
# 后端服务
pm2 start /var/www/indigenex/backend/server.js --name indigenex-api

# 如果需要单独部署后台
pm2 serve /var/www/indigenex/admin/dist 3001 --name indigenex-admin

pm2 save
pm2 startup
```

5. **Nginx 配置**
```nginx
server {
    listen 80;
    server_name indigenex.com www.indigenex.com;

    # 前台网站
    location / {
        root /var/www/indigenex/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 后台管理 (独立子域名或路径)
server {
    listen 80;
    server_name admin.indigenex.com;

    location / {
        root /var/www/indigenex/admin/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

6. **SSL 证书 (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d indigenex.com -d www.indigenex.com -d admin.indigenex.com
```

## API 端点

### 认证
- POST `/api/auth/login` - 登录
- GET `/api/auth/me` - 获取当前用户
- POST `/api/auth/change-password` - 修改密码

### 新闻
- GET `/api/news/public` - 获取已发布新闻列表
- GET `/api/news/public/:slug` - 获取单条新闻详情
- GET `/api/news` - 获取所有新闻 (需登录)
- POST `/api/news` - 创建新闻 (需登录)
- PUT `/api/news/:id` - 更新新闻 (需登录)
- DELETE `/api/news/:id` - 删除新闻 (需登录)

### 联系信息
- POST `/api/contact/submit` - 提交联系表单
- GET `/api/contact` - 获取所有联系信息 (需登录)
- PATCH `/api/contact/:id/read` - 标记已读 (需登录)
- DELETE `/api/contact/:id` - 删除联系信息 (需登录)

## 安全特性

1. **密码安全**
   - bcrypt 加密存储 (cost factor 12)
   - 强制密码复杂度要求
   - 首次登录强制修改默认密码

2. **API 安全**
   - JWT Token 认证
   - Rate Limiting (15分钟100请求)
   - 登录接口限流 (15分钟10次)
   - Helmet 安全头

3. **CORS 配置**
   - 生产环境限制特定域名
   - 开发环境允许 localhost

## 测试账号

部署完成后，可以使用以下账号验证登录功能：

1. **首次登录测试**
   - 访问: `http://your-domain/admin/`
   - 用户名: `admin`
   - 密码: `Ab1234567`
   - 预期: 跳转到修改密码页面

2. **密码修改测试**
   - 输入当前密码: `Ab1234567`
   - 设置新密码（需符合复杂度要求）
   - 预期: 修改成功后跳转到 Dashboard

## 开发团队任务分工

### 后端开发
- [x] 数据库设计 (Prisma Schema)
- [x] API 接口开发
- [x] 认证系统实现
- [x] 安全措施 (bcrypt/JWT/rate limiting)

### 前端开发
- [x] Next.js 项目搭建
- [x] Tailwind CSS 配置
- [x] 5个页面实现
- [x] 响应式设计

### 后台开发
- [x] React + Vite 项目
- [x] 登录/修改密码页面
- [x] 新闻管理 CRUD
- [x] 联系信息管理

### 测试
- [ ] API 单元测试 (Jest)
- [ ] 集成测试
- [ ] E2E 测试 (Cypress/Playwright)

### 运维部署
- [x] 部署文档
- [ ] Docker 配置
- [ ] CI/CD 流水线
- [ ] 监控告警

## 注意事项

1. 生产环境必须修改 `JWT_SECRET` 和数据库密码
2. 首次部署后应立即修改默认管理员密码
3. 建议配置自动备份策略
4. 定期更新依赖包以修复安全漏洞

## 许可证

私有项目 - 版权所有 © 2024 Indigenex Logistics
