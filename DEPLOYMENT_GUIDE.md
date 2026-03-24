# Carggo GM 网站开发部署完整指南

> 从需求到上线的全流程经验总结，包含所有踩坑记录，可供后续项目复用

---

## 一、项目架构概览

```
indigenex-website/
├── frontend/          # Next.js 14 (端口 3000)
│   ├── app/          # App Router
│   └── next.config.js
├── admin/            # React + Vite (静态部署，子目录 /admin)
│   ├── src/
│   ├── vite.config.ts
│   └── dist/         # 构建输出
└── backend/          # Express + Prisma + SQLite (端口 5001)
    ├── server.js     # 入口文件
    └── prisma/
```

**技术栈**: Next.js + React + Express + Prisma + SQLite + PM2 + Nginx

---

## 二、需求阶段

### 2.1 核心需求梳理
- **前台网站**: 企业展示型网站，Apple 美学风格
- **管理后台**: 新闻管理、联系表单查看
- **后端 API**: 认证、新闻 CRUD、联系表单提交

### 2.2 设计风格定义（Apple 美学）
```css
/* 核心设计 tokens */
--bg-primary: #F5F5F7      /* 页面背景 */
--bg-dark: #1D1D1F         /* Hero/Dark section */
--text-primary: #1D1D1F    /* 主文字 */
--text-secondary: #86868B  /* 次要文字 */
--accent: #007AFF          /* 主色调 */
--radius-card: 20px        /* 卡片圆角 */
--radius-button: 980px     /* 按钮圆角（胶囊形）*/
--shadow: 0 4px 24px rgba(0,0,0,0.08)
```

**设计原则**:
- 大量留白，内容密度低
- 圆角卡片（20px+）
- 细字体（font-weight: 400-500）
- 渐变和模糊效果（backdrop-filter）

---

## 三、开发阶段

### 3.1 初始化命令

```bash
# 1. 创建项目结构
mkdir indigenex-website && cd indigenex-website

# 2. 初始化各模块
# Frontend (Next.js)
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false

# Admin (Vite)
npm create vite@latest admin -- --template react-ts

# Backend (手动创建)
mkdir backend && cd backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken @prisma/client
npm install -D nodemon prisma
```

### 3.2 关键配置

#### Frontend next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  async rewrites() {
    return [
      // 开发环境代理到后端，生产环境由 Nginx 处理
      { source: '/api/:path*', destination: 'http://localhost:5001/api/:path*' },
    ];
  },
}
module.exports = nextConfig
```

#### Admin vite.config.ts（⚠️ 关键）
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',  // ← 关键：部署到子目录必须设置
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

**为什么要设置 `base: '/admin/'`**：
- Vite 构建时会在所有资源路径前加 `/admin/` 前缀
- 如：`/admin/assets/index-xxx.js`
- 不设置会导致资源 404

#### Admin main.tsx（⚠️ 关键）
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/admin">  {/* ← 关键：配合 base 配置 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

**为什么需要 `basename="/admin"`**：
- React Router 知道应用部署在 `/admin` 子路径下
- 路由匹配 `/admin/login` 而不是 `/login`
- 不设置会导致路由不匹配，页面空白

#### Backend 环境变量 .env
```bash
PORT=5001
JWT_SECRET=your_strong_secret_here_min_32_chars
DATABASE_URL="file:./dev.db"
NODE_ENV=production
```

#### Backend schema.prisma（⚠️ 跨平台关键）
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]  // ← 关键：支持多平台
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**为什么要设置 binaryTargets**：
- 本地开发（Mac ARM）和服务器（Linux x64）架构不同
- 不设置会导致 `Prisma Client could not locate the Query Engine` 错误
- 部署后必须执行 `npx prisma generate`

### 3.3 开发注意事项

| 问题 | 解决方案 |
|------|---------|
| API 404 | 检查 `next.config.js` rewrites 配置 |
| 图片不显示 | `unoptimized: true` 关闭 Next.js 图片优化 |
| 路由 404 | 启用 `trailingSlash: true` |
| 跨域问题 | 开发时通过 rewrites 代理，不要直接调 localhost:5001 |
| Admin 空白 | 检查 vite.config.ts `base` 和 main.tsx `basename` |

---

## 四、测试阶段

### 4.1 本地启动流程
```bash
# 1. 先启动后端（必须先启动，端口 5001）
cd backend && npm run dev

# 2. 启动前台（端口 3000）
cd frontend && npm run dev

# 3. 启动管理后台（端口 3001）
cd admin && npm run dev
```

### 4.2 功能检查清单
- [ ] 首页正常显示
- [ ] 联系表单能提交
- [ ] 后台能登录（admin / Ab1234567）
- [ ] 后台新闻 CRUD 正常
- [ ] API 返回正常（`curl http://localhost:5001/api/news`）

---

## 五、Git 版本控制（推荐）

### 5.1 为什么使用 Git

**优势**:
- 代码版本管理，随时回滚
- 本地/服务器同步更可靠（比 scp/rsync 稳定）
- 协作开发基础
- 部署流程标准化

### 5.2 Git 初始化

```bash
# 在项目根目录初始化
cd /Users/ligang/New/indigenex-website
git init

# 创建 .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
.next/
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local

# Database
*.db
*.db-journal

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Prisma
prisma/migrations/*/migration_lock.toml
EOF

# 初始提交
git add .
git commit -m "Initial commit: project setup"
```

### 5.3 Git 工作流程

**本地开发 → 提交 → 推送到服务器**

```bash
# 日常开发流程
git add .
git commit -m "描述本次修改"

# 方式1: 服务器拉取（推荐）
# 服务器上执行:
cd /var/www/indigenex-website
git pull origin main

# 方式2: 本地推送到服务器（如果服务器是 bare repo）
git push production main
```

### 5.4 服务器 Git 配置

**方案 A: 服务器从 GitHub/GitLab 拉取（推荐）**

```bash
# 1. 代码推送到 GitHub（本地执行）
git remote add origin https://github.com/username/repo.git
git push -u origin main

# 2. 服务器克隆（服务器执行）
cd /var/www
sudo git clone https://github.com/username/repo.git indigenex-website
sudo chown -R $(whoami):$(whoami) indigenex-website
```

**方案 B: 服务器作为 bare 仓库**

```bash
# 服务器上创建 bare 仓库
ssh admin@服务器IP
mkdir -p ~/git
cd ~/git
git init --bare indigenex-website.git

# 本地添加远程
git remote add production admin@服务器IP:~/git/indigenex-website.git
git push production main

# 服务器上 checkout
cd /var/www/indigenex-website
git init
git remote add origin ~/git/indigenex-website.git
git pull origin main
```

### 5.5 自动部署钩子（Git Hooks）

**服务器上配置 post-receive 钩子**

```bash
ssh admin@服务器IP
cat > ~/git/indigenex-website.git/hooks/post-receive << 'HOOK'
#!/bin/bash
TARGET="/var/www/indigenex-website"
GIT_DIR="/home/admin/git/indigenex-website.git"

echo "=== Deploying to production ==="
cd $TARGET || exit
git --git-dir=$GIT_DIR --work-tree=$TARGET checkout -f main

# 重新构建和重启
cd $TARGET/backend && npm install && npx prisma generate
cd $TARGET/frontend && npm install && npm run build
cd $TARGET/admin && npm install && npm run build

pm2 restart all
sudo systemctl reload nginx

echo "=== Deploy complete ==="
HOOK

chmod +x ~/git/indigenex-website.git/hooks/post-receive
```

**之后本地只需**: `git push production main` 即可自动部署

---

## 六、部署阶段

### 6.1 服务器选购

**推荐**: 阿里云轻量应用服务器
- **配置**: 1核2G，40G SSD
- **价格**: ¥24/月（新用户首年更便宜）
- **系统**: Ubuntu 22.04 LTS
- **地域**: 选择离用户最近的节点

**防火墙配置（阿里云控制台）**:
| 端口 | 用途 | 必需 |
|------|------|------|
| 22 | SSH | ✓ |
| 80 | HTTP | ✓ |
| 443 | HTTPS | 有域名时 |

### 5.2 服务器环境安装

```bash
# 1. SSH 登录
ssh root@你的服务器IP

# 2. 创建普通用户（避免用 root 运行应用）
adduser admin
usermod -aG sudo admin
su - admin

# 3. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. 安装 PM2（进程守护）
sudo npm install -g pm2

# 5. 安装 Nginx
sudo apt-get install -y nginx

# 6. 验证安装
node -v      # v20.x.x
npm -v
nginx -v
```

### 5.3 代码上传（⚠️ 关键优化点）

#### 问题：scp 传输慢
**原因**: `node_modules` 太大（几百 MB），且网络不稳定

#### 优化方案

**方案 1：服务器上直接 git clone（推荐）**
```bash
# 服务器上执行
cd /var/www
sudo git clone https://github.com/yourusername/indigenex-website.git
sudo chown -R $(whoami):$(whoami) indigenex-website
```

**方案 2：本地打包排除 node_modules**
```bash
# 本地打包（排除依赖）
cd /Users/ligang/New
tar czvf indigenex-website.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='dist' \
  indigenex-website/

# 上传到服务器
scp indigenex-website.tar.gz admin@服务器IP:/var/www/

# 服务器解压
ssh admin@服务器IP "cd /var/www && tar xzvf indigenex-website.tar.gz"
```

**方案 3：使用 rsync（增量同步）**
```bash
# 本地执行，只传差异
rsync -avz --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='dist' \
  /Users/ligang/New/indigenex-website/ \
  admin@服务器IP:/var/www/indigenex-website/
```

**⚠️ 重要：上传后设置权限**
```bash
sudo chown -R $(whoami):$(whoami) /var/www/indigenex-website
```

### 5.4 构建流程

```bash
cd /var/www/indigenex-website

# 1. 后端构建
cd backend
npm install
npx prisma migrate deploy
npx prisma generate

# 2. 前台构建
cd ../frontend
npm install
npm run build    # 生成 .next 目录

# 3. 后台构建
cd ../admin
npm install
npm run build    # 生成 dist 目录
```

### 5.5 PM2 启动（⚠️ 常见错误汇总）

#### ✅ 正确的启动命令
```bash
# 删除旧进程（如果有）
pm2 delete all

# 1. 启动后端（注意入口文件路径）
cd /var/www/indigenex-website/backend
pm2 start server.js --name backend

# 2. 启动前台（Next.js 服务器模式）
cd /var/www/indigenex-website/frontend
pm2 start "npm run start" --name frontend

# 3. 保存配置
pm2 save
pm2 startup
# 执行输出的命令（类似 sudo env PATH=...）
```

#### ❌ 常见错误及解决

| 错误 | 原因 | 解决 |
|------|------|------|
| `Cannot find module '/backend/src/index.js'` | 入口文件路径错误 | 用 `ls` 确认是 `server.js` 还是 `index.js` |
| `EACCES: permission denied` | 目录权限问题 | `sudo chown -R $(whoami):$(whoami) /var/www/项目` |
| `Cannot find module '../server/require-hook'` | node_modules 损坏 | `rm -rf node_modules && npm install` |
| `PrismaClientInitializationError` | 数据库未初始化 | `npx prisma migrate deploy && npx prisma generate` |
| `binaryTargets` 错误 | Prisma 平台不兼容 | 修改 schema.prisma 添加 `binaryTargets = ["native", "debian-openssl-3.0.x"]` |

#### 查看日志命令
```bash
pm2 logs backend --lines 50    # 后端日志
pm2 logs frontend --lines 50   # 前端日志
pm2 status                      # 查看运行状态
```

### 5.6 Nginx 配置（⚠️ 最复杂部分）

**⚠️ 坑点预警**：Admin 部署到 `/admin` 子目录非常容易出错，以下配置经过实战验证

```nginx
server {
    listen 80;
    server_name _;

    # Admin 静态资源（必须放在最前面，优先级最高）
    location /admin/assets/ {
        alias /var/www/indigenex-website/admin/dist/assets/;
        expires 30d;
    }

    # Admin 根路径资源（logo 等）
    location /logo.png {
        alias /var/www/indigenex-website/admin/dist/logo.png;
    }

    # 前台网站 (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API 转发到后端
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admin 后台 - SPA 模式
    location /admin {
        alias /var/www/indigenex-website/admin/dist/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
}
```

**关键配置解析**：

| 配置 | 作用 | 坑点 |
|------|------|------|
| `location /admin/assets/` | 处理 JS/CSS 资源 | 必须放在最前面，否则会被 `location /` 拦截 |
| `alias /var/www/.../dist/;` | 指定文件根目录 | 末尾必须有 `/`，否则路径拼接错误 |
| `try_files $uri $uri/ /admin/index.html;` | SPA 路由回退 | 所有路由都返回 index.html，让 React Router 处理 |

**⚠️ 绝对不要这样配（会导致循环重定向）**：
```nginx
# ❌ 错误示例
location /admin {
    alias /var/www/indigenex-website/admin/dist/;
    try_files $uri $uri/ /admin/index.html;  # 会导致循环重定向
}
```

**正确做法**：去掉 `try_files` 中的回退，或改用 `root`：
```nginx
# ✅ 正确示例 1：使用 root（推荐）
location /admin {
    root /var/www/indigenex-website/admin/dist;
    try_files $uri $uri/ =404;
}

# ✅ 正确示例 2：去掉 try_files
location /admin {
    alias /var/www/indigenex-website/admin/dist/;
    index index.html;
}
```

启用配置：

```bash
sudo ln -sf /etc/nginx/sites-available/carggo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 5.7 HTTPS 配置（有域名时）

```bash
# 安装 certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 六、Admin 部署专项排查指南

如果 Admin 页面空白，按以下顺序排查：

### 6.1 检查 Vite 配置
```bash
cat /var/www/indigenex-website/admin/vite.config.ts
# 确认有 base: '/admin/'
```

### 6.2 检查 React Router 配置
```bash
cat /var/www/indigenex-website/admin/src/main.tsx
# 确认有 basename="/admin"
```

### 6.3 检查构建输出
```bash
# index.html 中的资源路径应该是 /admin/assets/...
cat /var/www/indigenex-website/admin/dist/index.html
```

### 6.4 检查 Nginx 配置
```bash
cat /etc/nginx/sites-available/carggo
# 确认 /admin/assets/ 在最前面
```

### 6.5 浏览器开发者工具检查
按 F12 打开：

| 标签 | 检查内容 | 正常状态 |
|------|---------|---------|
| Network | JS/CSS 加载 | 200，路径是 /admin/assets/... |
| Console | 红色错误 | 无任何错误 |
| Elements | `<div id="root">` | 内有 React 渲染的内容 |

### 6.6 常见症状对照表

| 症状 | 原因 | 解决 |
|------|------|------|
| Network 里 JS 404 | Nginx 没配 /admin/assets/ | 添加 location /admin/assets/ |
| Console 无错误，页面空白 | React Router basename 没配 | 添加 basename="/admin" |
| 资源路径是 /assets/ 而非 /admin/assets/ | vite.config.ts 没配 base | 添加 base: '/admin/' |
| 刷新后 404 | try_files 配置错误 | 检查 try_files 语法 |

---

## 七、验证清单

部署完成后逐项检查：

| 检查项 | 命令/操作 | 预期结果 |
|--------|----------|---------|
| 后端运行 | `pm2 list` | status: online |
| 前端运行 | `pm2 list` | status: online |
| API 正常 | `curl http://localhost:5001/api/news` | 返回 JSON |
| 前台访问 | 浏览器访问 `http://服务器IP` | 显示首页 |
| 后台访问 | 浏览器访问 `http://服务器IP/admin` | 显示登录页（非空白）|
| 后台登录 | admin / Ab1234567 | 进入 Dashboard |
| 联系表单 | 提交测试 | 成功提示 |
| 后台查看留言 | 刷新列表 | 显示刚提交的留言 |
| Nginx 状态 | `sudo systemctl status nginx` | active (running) |

---

## 八、运维命令速查

```bash
# 查看应用日志
pm2 logs

# 重启应用
pm2 restart all

# 重启单个应用
pm2 restart backend

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看系统资源
top
free -h
df -h

# 备份数据库（SQLite）
cp /var/www/indigenex-website/backend/prisma/dev.db /backup/dev-$(date +%Y%m%d).db
```

---

## 九、新网站部署模板

### 9.1 复用检查清单

**开发阶段**:
- [ ] 确定技术栈（推荐：Next.js + Express + SQLite 轻量组合）
- [ ] 配置 next.config.js（rewrites + trailingSlash）
- [ ] API 使用相对路径 `/api/xxx`，不要写死 localhost
- [ ] **Admin 项目：配置 vite.config.ts `base` 和 main.tsx `basename`**
- [ ] **Prisma 配置 binaryTargets 支持多平台**
- [ ] **移动端适配：使用设备检测或响应式设计**
- [ ] **移动端导航：添加下拉蒙版效果（bg-black/60 backdrop-blur）**

**移动端专项开发清单**:

```
□ 首页
  □ DesktopHero - 大图+侧边文字布局
  □ MobileHero - 全屏背景+底部堆叠文字
  □ Stats - PC水平排列 / 移动端水平滚动或2x2网格
  □ Services - PC网格 / 移动端垂直卡片

□ 关于页
  □ Desktop - 左右分栏图文
  □ Mobile - 垂直堆叠，图片圆角
  □ Team - PC网格 / 移动端列表

□ 服务页
  □ Desktop - 2列服务卡片
  □ Mobile - 单列卡片+标签
  □ Process - PC水平步骤 / 移动端垂直时间线

□ 联系页
  □ Desktop - 左右分栏（表单+信息）
  □ Mobile - 顶部快捷按钮+表单+折叠FAQ

□ 导航栏
  □ Desktop - 水平菜单
  □ Mobile - 汉堡菜单
  □ Mobile下拉蒙版 - bg-black/60 backdrop-blur-sm
```

**移动端部署验证**:
- [ ] Chrome DevTools 设备模拟测试
- [ ] iPhone Safari 测试（如果有）
- [ ] Android Chrome 测试（如果有）
- [ ] 导航下拉蒙版效果正常
- [ ] 所有按钮可点击（min 44px）
- [ ] 表单输入正常

**部署阶段**:
- [ ] 购买服务器（阿里云 1核2G 起步）
- [ ] 配置防火墙（80/443 端口）
- [ ] 环境安装（Node.js 20 + PM2 + Nginx）
- [ ] 代码上传（优先 git clone 或 rsync，避免 scp 整个目录）
- [ ] 目录权限设置（chown 避免权限问题）
- [ ] 后端构建（npm install + prisma migrate + prisma generate）
- [ ] 前台构建（npm run build）
- [ ] **Admin 构建（确认 vite.config.ts base 配置）**
- [ ] PM2 启动（先确认入口文件路径）
- [ ] **Nginx 配置（Admin 资源路径放最前面）**
- [ ] HTTPS 配置（有域名时）

### 9.2 一键部署脚本模板

```bash
#!/bin/bash
# deploy.sh - 放在项目根目录

set -e

echo "=== 开始部署 ==="

# 配置
SERVER_IP="你的IP"
SERVER_USER="admin"
PROJECT_PATH="/var/www/indigenex-website"

# 1. 本地构建
echo "[1/5] 本地构建..."
cd frontend && npm run build && cd ..
cd admin && npm run build && cd ..

# 2. 同步到服务器（排除 node_modules）
echo "[2/5] 同步到服务器..."
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.next' \
  ./ ${SERVER_USER}@${SERVER_IP}:${PROJECT_PATH}/

# 3. 服务器端构建和重启
echo "[3/5] 服务器端构建..."
ssh ${SERVER_USER}@${SERVER_IP} << 'REMOTE'
  cd /var/www/indigenex-website/backend
  npm install
  npx prisma migrate deploy
  npx prisma generate

  cd /var/www/indigenex-website/frontend
  npm install
  npm run build

  cd /var/www/indigenex-website/admin
  npm install
  npm run build

  pm2 restart all
  sudo systemctl reload nginx
REMOTE

echo "=== 部署完成 ==="
echo "访问: http://${SERVER_IP}"
echo "后台: http://${SERVER_IP}/admin"
```

---

## 十、经验总结

### 10.1 时间分配建议
- 开发阶段：60%
- 测试阶段：15%
- **部署阶段：25%（第一次部署总是比预期久）**
- **Admin 子目录部署：额外 10%（最容易踩坑）**

### 10.2 最常踩的坑（按频率排序）

| 排名 | 坑 | 发生场景 | 解决 |
|-----|---|---------|------|
| 1 | **Admin 页面空白** | React + Vite 部署到子目录 | vite.config.ts `base` + main.tsx `basename` |
| 2 | **Prisma 平台不兼容** | Mac 开发部署到 Linux 服务器 | schema.prisma 添加 `binaryTargets` |
| 3 | **node_modules 上传慢** | scp 传整个项目 | git clone 或 rsync 排除 node_modules |
| 4 | **Nginx 重定向循环** | try_files 配置错误 | 去掉 try_files 中的 `/admin/index.html` |
| 5 | **资源 404** | /assets/ 路径被前台拦截 | Nginx 中 `/admin/assets/` 放最前面 |
| 6 | **权限拒绝** | 目录权限问题 | `chown -R $(whoami):$(whoami) /var/www/项目` |
| 7 | **移动端导航蒙版失效** | 构建缓存导致代码未更新 | 清理 .next 后重新构建 |
| 8 | **移动端布局错乱** | 未检测设备类型或响应式断点错误 | 使用 `useMobileDetect` 或检查 Tailwind 断点 |
| 9 | **SSH 免密失败** | 密钥对配置不完整 | 检查 ~/.ssh/config 和私钥权限 |
| 10 | **后台 500 错误** | 只部署了 frontend，backend 未启动 | deploy.sh 必须包含所有服务 |
| 11 | **admin 构建失败** | 缺少 tsconfig.json | 补充 TypeScript 配置文件 |
| 12 | **Nginx 500 错误** | 循环重定向或配置语法错误 | 检查 try_files 和 location 匹配 |

### 10.3 成本参考
- 服务器：¥24/月（阿里云轻量）
- 域名：¥30-80/年（.cn 或 .com）
- 总计：约 ¥350/年

---

## 附录：文件结构参考

```
indigenex-website/
├── DEPLOYMENT_GUIDE.md    # 本文件
├── docker-compose.yml     # Docker 部署（可选）
├── backend/
│   ├── server.js          # 入口
│   ├── package.json
│   ├── .env               # 环境变量（不上传）
│   └── prisma/
│       ├── schema.prisma  # 注意 binaryTargets
│       └── dev.db         # SQLite 数据库
├── frontend/
│   ├── next.config.js     # 关键配置（rewrites）
│   ├── package.json
│   └── app/               # Next.js App Router
└── admin/
    ├── vite.config.ts     # 关键：base: '/admin/'
    ├── src/
    │   └── main.tsx       # 关键：basename="/admin"
    └── dist/              # 构建输出
```

---

## 十一、SSH密钥对部署完整指南（2026-03-23 新增）

### 11.1 今日部署问题复盘

#### 时间线回顾

| 时间 | 事件 | 问题 | 解决 |
|------|------|------|------|
| 09:00 | 开始部署 | SSH连接失败 | 配置SSH密钥 |
| 09:15 | Permission denied | 本地无私钥配置 | 添加 ~/.ssh/config |
| 10:00 | SSH成功 | 后台500错误 | backend未启动 |
| 10:15 | 启动backend | admin 500错误 | admin未构建 |
| 10:45 | 构建admin | 缺少tsconfig.json | 创建配置文件 |
| 11:15 | 构建成功 | Nginx循环重定向 | 修复try_files |
| 11:45 | 全部正常 | HTTP 200 | 部署完成 |

#### 核心问题详细解析

**问题1: SSH密钥对配置不完整**

现象:
```bash
ssh root@47.236.193.197
Permission denied (publickey)
```

原因:
- 阿里云控制台已绑定密钥对 ✓
- 服务器已重启 ✓
- **本地 ~/.ssh/config 未配置** ✗

正确配置:
```bash
# 1. 确认私钥存在
ls ~/.ssh/deploy-key.pem

# 2. 配置SSH
Host indigenex-server
    HostName 47.236.193.197
    User root
    IdentityFile ~/.ssh/deploy-key.pem
    StrictHostKeyChecking no

chmod 600 ~/.ssh/config
```

**问题2: 服务启动不完整（deploy.sh缺陷）**

原deploy.sh只部署了frontend，导致:
- 前台正常 ✓
- 后台500 ✗ (backend未启动)
- admin 500 ✗ (未构建)

正确做法 - 完整deploy.sh:
```bash
#!/bin/bash
# deploy-complete.sh

echo "[1/3] 部署 Frontend..."
cd frontend && npm run build && cd ..
rsync -avz frontend/ server:/var/www/frontend/

# 启动frontend
ssh server "cd /var/www/frontend && pm2 restart indigenex-frontend || pm2 start npm --name indigenex-frontend -- start"

echo "[2/3] 部署 Backend..."
rsync -avz backend/ server:/var/www/backend/
ssh server "cd /var/www/backend && npm install && pm2 restart indigenex-backend || pm2 start server.js --name indigenex-backend"

echo "[3/3] 部署 Admin..."
cd admin
# 检查tsconfig
[ -f tsconfig.json ] || { echo "缺少tsconfig.json"; exit 1; }
npm run build
cd ..
rsync -avz admin/dist/ server:/var/www/admin/dist/
ssh server "pm2 save"

echo "验证..."
curl -s -o /dev/null -w "%{http_code}" http://47.236.193.197/
curl -s -o /dev/null -w "%{http_code}" http://47.236.193.197/admin/
```

**问题3: admin缺少tsconfig.json**

现象:
```bash
npm run build
tsc: error TS5083: Cannot read file '/tsconfig.json'
```

解决:
```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

**问题4: Nginx循环重定向**

现象:
```
rewrite or internal redirection cycle
```

错误配置:
```nginx
location /admin {
    alias /var/www/admin/dist/;
    try_files $uri $uri/ /admin/index.html;  # 循环！
}
```

正确配置:
```nginx
server {
    # 1. 静态资源（最前）
    location /admin/assets/ {
        alias /var/www/admin/dist/assets/;
    }

    # 2. 重定向 /admin 到 /admin/
    location = /admin {
        return 301 /admin/;
    }

    # 3. Admin主配置
    location /admin/ {
        alias /var/www/admin/dist/;
        index index.html;
        try_files $uri $uri/ =404;  # 不要写 /admin/index.html
    }
}
```

### 11.2 完整部署检查清单 V2.0

```bash
□ 部署前检查
  □ SSH免密: ssh indigenex-server "echo OK"
  □ 本地构建测试: cd frontend && npm run build
  □ admin配置: [ -f admin/tsconfig.json ]
  □ Git提交: git status

□ 部署执行
  □ 运行: ./deploy-complete.sh
  □ 查看输出无错误

□ 部署后验证
  □ 前台: curl -s http://IP/ | head -1
  □ 后台: curl -s http://IP/admin/ | head -1
  □ API: curl -s http://IP/api/news (应返回401)
  □ PM2: ssh server 'pm2 status' (应2个online)
  □ Nginx: ssh server 'nginx -t'
```

### 11.3 一键修复脚本

创建 `fix-deploy.sh`:
```bash
#!/bin/bash
# 修复常见部署问题

echo "=== 部署问题修复 ==="

# 1. 检查并启动缺失的服务
echo "[1/4] 检查服务..."
ssh indigenex-server '
  pm2 status | grep -q "indigenex-backend" || {
    echo "启动 backend..."
    cd /var/www/indigenex-website/backend
    pm2 start server.js --name indigenex-backend
  }
  pm2 status | grep -q "indigenex-frontend" || {
    echo "启动 frontend..."
    cd /var/www/indigenex-website/frontend
    pm2 start npm --name indigenex-frontend -- start
  }
  pm2 save
'

# 2. 检查admin构建
echo "[2/4] 检查 admin..."
ssh indigenex-server '
  if [ ! -d "/var/www/indigenex-website/admin/dist" ]; then
    echo "⚠️ admin未构建"
  fi
'

# 3. 检查Nginx
echo "[3/4] 检查 Nginx..."
ssh indigenex-server 'nginx -t && systemctl reload nginx'

# 4. 验证
echo "[4/4] 验证..."
curl -s -o /dev/null -w "前台: %{http_code}\n" http://47.236.193.197/
curl -s -o /dev/null -w "后台: %{http_code}\n" http://47.236.193.197/admin/

echo "=== 完成 ==="
```

---

## 十二、移动端开发设计要点总结

### 12.1 为什么必须做移动端适配

- **流量占比**: 超过 60% 的网站访问来自移动设备
- **SEO 要求**: Google 优先索引移动版网站（Mobile-First Indexing）
- **用户体验**: 触屏操作与鼠标操作完全不同
- **商业转化**: 移动端转化率直接影响业务

### 11.2 本次项目移动端实现要点

**采用方案**: 设备检测双版本（useMobileDetect Hook）

**核心代码结构**:
```
frontend/app/
├── page.tsx              # 首页 - Desktop + Mobile 双版本
├── about/page.tsx        # 关于页 - Desktop + Mobile 双版本
├── services/page.tsx     # 服务页 - Desktop + Mobile 双版本
├── contact/page.tsx      # 联系页 - Desktop + Mobile 双版本
└── components/
    └── Navigation.tsx    # 导航栏 - 含移动端下拉蒙版
```

**设备检测逻辑**:
- User Agent 字符串检测（Android/iOS）
- Touch 设备检测（pointer: coarse）
- 屏幕宽度检测（< 768px）
- 三者组合判断，准确率 > 95%

**导航栏蒙版设计**:
```
下拉前: 导航栏透明/毛玻璃
下拉后:
  - 导航栏: bg-[#1D1D1F]/98 backdrop-blur-xl（深色背景+模糊）
  - 页面蒙版: bg-black/60 backdrop-blur-sm（60%黑+模糊）
  - 菜单项: 白色文字，垂直排列，全宽点击
```

**各页面移动端设计差异**:

| 页面 | PC 端特点 | 移动端特点 |
|------|----------|-----------|
| 首页 | Hero大图+侧边文字 | 全屏图+底部堆叠+CTA按钮 |
| 关于 | 左右分栏图文 | 垂直堆叠+圆角图片+紧凑文字 |
| 服务 | 2列卡片网格 | 单列卡片+特征标签+简化描述 |
| 联系 | 左右分栏（表单+信息） | 顶部快捷按钮+全宽表单+折叠FAQ |

### 11.3 移动端性能优化

- **图片**: 使用 Unsplash 压缩图，移动端加载 800px 宽度版本
- **字体**: 使用系统字体栈（-apple-system, SF Pro）
- **动画**: 移动端禁用复杂动画，使用简单过渡
- **代码分割**: Next.js 自动代码分割，按需加载

### 11.4 测试验证方法

**本地开发测试**:
1. Chrome DevTools → Device Toolbar
2. 选择 iPhone 14 Pro / iPhone SE / Samsung Galaxy
3. 刷新页面查看效果
4. 触摸模式测试（手指图标）

**真机测试**:
- 同一局域网 WiFi 下，手机访问 `http://电脑IP:3000`
- 或使用 ngrok 内网穿透

**部署后验证**:
- 访问 `http://47.236.193.197/`
- 手机浏览器测试
- 微信内置浏览器测试（国内用户主要场景）

### 11.5 本次移动端开发时间投入

- **开发时间**: 约 6 小时（4 个页面 + 导航栏适配）
- **占项目总工时**: ~20%
- **验证测试**: 约 2 小时

**经验**: 移动端开发不应是事后补救，应在一开始就规划双版本架构。

---

> 文档版本: 2.3
> 最后更新: 2026-03-23
> 适用项目: Carggo GM 及类似企业展示网站（含 Admin 子目录部署 + 移动端适配）
> 特别说明: 本文档包含实战踩坑记录，v2.2 新增移动端开发设计要点，v2.3 新增SSH密钥部署问题复盘与完整解决方案
