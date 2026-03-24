# 网站开发部署标准化工作流程

> 基于 Carggo GM 项目经验总结，从需求到上线的标准化、可复用流程

---

## 一、流程概览

```
需求文档 → 设计确认 → 开发实现 → 测试验证 → 部署上线
   ↓           ↓          ↓          ↓          ↓
  1天        1-2天      3-5天      1-2天      0.5天
```

**总周期**: 约 1-2 周（视功能复杂度）

---

## 二、角色分工

### 2.1 用户（Product Owner）
**职责**:
- 提供需求文档（文字描述即可）
- 确认设计稿（截图审核）
- 验收功能并反馈调整
- 提供服务器/域名等资源

**交付物**:
- `REQUIREMENTS.md` - 需求描述文档
- 参考网站/设计风格示例（可选）
- 文案内容（公司介绍、服务内容等）

### 2.2 Claude（Developer + Designer + DevOps）
**职责**:
- 将需求转化为设计稿（Pencil）
- 全栈开发（前端 + 后端）
- 部署上线
- 编写技术文档

**交付物**:
- 设计稿截图（Pencil）
- 完整代码
- 部署配置
- 操作手册

---

## 三、标准化阶段流程

### 阶段 1: 需求收集（半天）

#### 输入
用户提供以下内容（可直接发消息或写 Markdown）:

```markdown
# 项目需求文档

## 1. 项目概述
- 项目名称:
- 项目类型: [企业官网 / 电商 / 管理系统 / 其他]
- 目标用户:
- 参考网站: （如果有）

## 2. 功能需求
### 前台功能
- [ ] 首页（英雄区 + 服务介绍 + 关于我们 + CTA）
- [ ] 关于我们页
- [ ] 服务/产品页
- [ ] 联系表单
- [ ] 其他: ___

### 后台功能
- [ ] 内容管理（新闻/文章）
- [ ] 表单数据查看
- [ ] 用户管理
- [ ] 其他: ___

## 3. 设计风格
- [ ] Apple 简约风（推荐）
- [ ] 商务专业风
- [ ] 活泼创意风
- [ ] 其他: ___

## 4. 文案内容
（直接粘贴或附件提供）
- 公司简介:
- 服务内容:
- 联系方式:

## 5. 技术偏好
- [ ] 推荐技术栈（Next.js + Express + SQLite）
- [ ] 指定技术栈: ___

## 6. 部署需求
- [ ] 阿里云轻量服务器（推荐 ¥24/月）
- [ ] 已有服务器（提供 IP/账号/密码）
- [ ] 需要域名 + HTTPS
```

#### 输出
我输出: `DESIGN_PROPOSAL.md`
- 设计思路简述
- 预计时间
- 技术方案确认

---

### 阶段 2: 设计阶段（1-2 天）

#### 我的工作
1. 使用 Pencil 创建设计稿
2. 生成关键页面截图
3. 输出设计说明

#### 用户确认点
用户需要确认:
- [ ] 首页布局（英雄区 + 内容区块）
- [ ] 配色方案
- [ ] 导航结构
- [ ] 后台界面布局

**确认方式**: 直接在截图上回复修改意见

#### 设计规范（Apple 风格默认）
```
背景: #F5F5F7
主文字: #1D1D1F
次要文字: #86868B
强调色: #007AFF
卡片圆角: 20px
按钮圆角: 980px（胶囊形）
```

---

### 阶段 3: 开发阶段（3-5 天）

#### 3.1 移动端适配开发（新增必修项）

现代网站必须同时适配 **PC 桌面端** 和 **移动端**，采用**响应式设计**或**设备检测双版本**方案。

**技术选型对比**:

| 方案 | 实现方式 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| **CSS 媒体查询** | 一套代码，不同样式 | 维护简单，SEO 友好 | 代码复杂度增加 | 布局差异不大的网站 |
| **设备检测双版本** | useEffect 检测设备，渲染不同组件 | 可针对移动优化布局 | 代码量增加 | 复杂交互、差异大的网站 |
| **混合方案** | 布局用媒体查询，组件用设备检测 | 灵活度高 | 技术栈要求高 | 本次项目采用 |

**设备检测 Hook 标准实现**:

```typescript
// hooks/useMobileDetect.ts
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, mounted };
}
```

**移动端设计原则**:

1. **触控优化**
   - 按钮最小尺寸 44x44px
   - 增大点击热区
   - 避免悬停效果（hover）

2. **垂直堆叠布局**
   - 将水平排列改为垂直排列
   - 单栏布局为主
   - 减少横向滚动

3. **内容精简**
   - 减少文字密度
   - 使用卡片式/折叠面板展示信息
   - 隐藏非核心内容（如背景图）

4. **导航栏特殊处理**
   - 汉堡菜单（三线图标）
   - **下拉时添加背景蒙版**（见下方实现）
   - 菜单项使用全宽点击区域

**移动端导航栏蒙版实现**:

```tsx
// components/Navigation.tsx - 移动端下拉蒙版
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOpen
        ? 'bg-[#1D1D1F]/98 backdrop-blur-xl shadow-lg'  // 展开时深色背景
        : scrolled
          ? 'glass border-b border-black/5 shadow-sm'
          : 'bg-transparent'
    }`}>
      {/* ... 导航内容 ... */}

      {/* 移动端菜单蒙版 - 关键实现 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}  // 点击蒙版关闭菜单
        />
      )}

      {/* 移动端菜单 */}
      {isOpen && (
        <div className="md:hidden relative z-50 py-4 border-t border-white/10">
          {/* 菜单项 */}
        </div>
      )}
    </nav>
  );
}
```

**蒙版效果说明**:
- `bg-black/60` - 60% 黑色透明度，遮挡页面内容
- `backdrop-blur-sm` - 背景模糊，视觉聚焦到菜单
- `z-40` - 层级低于菜单（z-50），高于页面内容
- 点击蒙版关闭菜单，提升用户体验

**页面级移动端适配示例**:

```tsx
// app/page.tsx
'use client';
import { useIsMobile } from './hooks/useMobileDetect';

// 桌面端组件
function DesktopHomePage() {
  return (
    <>
      <section className="bg-[#1D1D1F] pt-32 pb-20">
        {/* PC 布局：大图 + 侧边内容 */}
      </section>
    </>
  );
}

// 移动端组件
function MobileHomePage() {
  return (
    <div className="mobile-home">
      <section className="relative min-h-[85vh] flex flex-col justify-end">
        {/* 移动端布局：全屏图 + 底部文字 */}
      </section>
    </div>
  );
}

// 主页面
export default function HomePage() {
  const { isMobile, mounted } = useIsMobile();

  if (!mounted) {
    return <div className="min-h-screen bg-[#F5F5F7]" />;
  }

  return isMobile ? <MobileHomePage /> : <DesktopHomePage />;
}
```

**移动端检查清单**:

| 检查项 | PC 端 | 移动端 | 说明 |
|--------|-------|--------|------|
| Hero 区域 | 大图 + 侧边文字 | 全屏图 + 底部堆叠文字 | 垂直布局 |
| 服务卡片 | 2-4 列网格 | 单列垂直堆叠 | 卡片宽度 100% |
| 数据统计 | 水平排列 | 水平滚动或 2x2 网格 | 触摸滑动友好 |
| 联系表单 | 左右分栏 | 垂直堆叠 | 输入框全宽 |
| 导航栏 | 水平菜单 | 汉堡菜单 + 下拉蒙版 | 60% 黑色蒙版 |
| 按钮 | 正常大小 | 增大点击区域 | min 44px |
| 字体大小 | 16px+ | 14-16px | 移动端略小 |
| 间距 | 64-96px | 40-64px | 减少留白 |

#### 3.2 项目初始化与 Git 配置（第 1 天上午）

**标准初始化流程**

```bash
# 1. 创建项目目录
mkdir new-project && cd new-project

# 2. 初始化 Git（必须）
git init

# 3. 创建标准化目录结构
cat > init.sh << 'INIT_EOF'
#!/bin/bash
set -e

PROJECT_NAME="${1:-my-project}"
echo "=== 初始化项目: $PROJECT_NAME ==="

# 创建目录
mkdir -p frontend admin backend/prisma

# Frontend (Next.js)
echo "[1/3] 初始化 Frontend..."
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --use-npm
cd ..

# Admin (Vite + React)
echo "[2/3] 初始化 Admin..."
cd admin
npm create vite@latest . -- --template react-ts
npm install react-router-dom @types/node lucide-react
npm install -D autoprefixer postcss tailwindcss
npx tailwindcss init -p
cd ..

# Backend (Express)
echo "[3/3] 初始化 Backend..."
cd backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken @prisma/client helmet express-rate-limit
npm install -D nodemon prisma @types/express @types/cors @types/bcryptjs @types/jsonwebtoken typescript ts-node

# 初始化 Prisma
npx prisma init --datasource-provider sqlite
cd ..

echo "=== 初始化完成 ==="
echo "下一步: 配置 Git 和复制标准配置文件"
INIT_EOF

chmod +x init.sh
./init.sh
```

**Git 配置（必需步骤）**

```bash
# 1. 创建 .gitignore
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
.next/
dist/
build/

# Environment
.env
.env.local

# Database
*.db
*.db-journal

# IDE
.vscode/
.idea/
.DS_Store

# Logs
logs/
*.log
GITIGNORE

# 2. 初始提交
git add .
git commit -m "Initial commit: project scaffold"

# 3. 添加远程仓库（GitHub/GitLab/Gitee）
git remote add origin https://github.com/username/project.git
git push -u origin main
```

**为什么必须先用 Git**
- 服务器部署通过 `git pull` 更新，比 scp/rsync 更可靠
- 代码变更可追溯，问题可回滚
- 协作开发的基础

#### 3.2 复制标准配置文件

**frontend/next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:5001/api/:path*' },
    ];
  },
}
module.exports = nextConfig
```

**admin/vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 3001,
    proxy: { '/api': { target: 'http://localhost:5001', changeOrigin: true }}
  },
  build: { outDir: 'dist' }
})
```

**admin/src/main.tsx**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/admin">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

**backend/prisma/schema.prisma**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  username     String    @unique
  password     String
  role         String    @default("ADMIN")
  createdAt    DateTime  @default(now())
}
```

#### 3.3 开发检查清单

| 模块 | 检查项 | 状态 |
|------|--------|------|
| Git | 初始化 Git 仓库 | ☐ |
| Git | 配置 .gitignore | ☐ |
| Git | 创建首次提交 | ☐ |
| Git | 推送到远程仓库 | ☐ |
| Frontend | 页面路由正常 | ☐ |
| Frontend | API 代理配置正确 | ☐ |
| Frontend | 响应式布局（移动端） | ☐ |
| Admin | vite.config.ts base 配置 | ☐ |
| Admin | main.tsx basename 配置 | ☐ |
| Admin | 登录/登出功能 | ☐ |
| Backend | schema.prisma binaryTargets | ☐ |
| Backend | JWT 认证中间件 | ☐ |
| Backend | API 路由前缀 /api | ☐ |
| All | 环境变量 .env 配置 | ☐ |

---

### 阶段 4: 测试阶段（1-2 天）

#### 本地测试命令

```bash
# 一键启动所有服务（tmux 或三个终端窗口）

# 终端 1: 后端
cd backend && npm run dev

# 终端 2: 前台
cd frontend && npm run dev

# 终端 3: 后台
cd admin && npm run dev
```

#### 测试用例清单

| 场景 | 操作 | 预期结果 |
|------|------|---------|
| 首页访问 | 打开 http://localhost:3000 | 正常显示 |
| 联系表单 | 填写并提交 | 成功提示 |
| 后台登录 | http://localhost:3001 | 显示登录页 |
| 后台登录 | 输入错误密码 | 错误提示 |
| 后台功能 | 登录后 CRUD | 数据正常 |
| API 测试 | GET /api/news | 返回 JSON |
| 移动端 | 手机模式预览 | 布局正常 |

---

### 阶段 5: 部署阶段（半天）

#### 5.1 服务器准备

**阿里云轻量服务器配置**:
- 1核2G，Ubuntu 22.04
- 开放端口: 22, 80, 443
- 价格: ¥24/月

#### 5.2 部署脚本（服务器执行）

**方案 A: Git 部署（推荐）**

```bash
#!/bin/bash
# deploy.sh - Git 自动部署脚本

set -e
PROJECT_DIR="/var/www/project"
GIT_REPO="https://github.com/username/repo.git"

echo "=== Git Auto Deployment ==="

# 1. 首次部署克隆仓库
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "[1/7] 首次部署: 克隆仓库..."
    sudo mkdir -p /var/www
    cd /var/www
    sudo git clone $GIT_REPO project
    sudo chown -R $(whoami):$(whoami) $PROJECT_DIR
fi

cd $PROJECT_DIR

# 2. 更新代码
echo "[2/7] 拉取最新代码..."
git fetch origin
git reset --hard origin/main

# 3. 安装依赖
echo "[3/7] 检查环境..."
command -v node >/dev/null 2>&1 || {
    echo "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
}
command -v pm2 >/dev/null 2>&1 || {
    echo "安装 PM2..."
    sudo npm install -g pm2
}
command -v nginx >/dev/null 2>&1 || {
    echo "安装 Nginx..."
    sudo apt-get install -y nginx
}

# 4. 后端构建
echo "[4/7] 后端构建..."
cd $PROJECT_DIR/backend
npm install
npx prisma migrate deploy
npx prisma generate
pm2 delete backend 2>/dev/null || true
pm2 start server.js --name backend
cd ..

# 5. 前台构建
echo "[5/7] 前台构建..."
cd $PROJECT_DIR/frontend
npm install
npm run build
pm2 delete frontend 2>/dev/null || true
pm2 start "npm run start" --name frontend
cd ..

# 6. 后台构建
echo "[6/7] 后台构建..."
cd $PROJECT_DIR/admin
npm install
npm run build
cd ..

# 6. Nginx 配置
echo "[6/6] Nginx 配置..."
sudo tee /etc/nginx/sites-available/project << 'EOF'
server {
    listen 80;
    server_name _;

    # Admin 静态资源（必须最前）
    location /admin/assets/ {
        alias /var/www/project/admin/dist/assets/;
        expires 30d;
    }
    location /admin/logo.png {
        alias /var/www/project/admin/dist/logo.png;
    }

    # 前台
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Admin
    location /admin {
        alias /var/www/project/admin/dist/;
        index index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/project /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. 保存 PM2
pm2 save
pm2 startup

echo "=== 部署完成 ==="
echo "前台: http://$(curl -s ifconfig.me)"
echo "后台: http://$(curl -s ifconfig.me)/admin"
```

**方案 B: 自动部署钩子（高级）**

服务器配置 Git post-receive 钩子，实现 `git push` 即部署：

```bash
# 服务器上执行
ssh admin@服务器IP
mkdir -p ~/git
cd ~/git
git init --bare project.git

cat > project.git/hooks/post-receive << 'HOOK'
#!/bin/bash
TARGET="/var/www/project"
echo "Deploying..."
cd $TARGET
git pull origin main
./deploy/deploy.sh
HOOK

chmod +x project.git/hooks/post-receive
```

**本地只需**: `git push production main` 即可自动部署

**日常更新流程**

```bash
# 本地开发
git add .
git commit -m "更新内容"
git push origin main      # 推送到 GitHub
git push production main  # 推送到服务器（触发自动部署）
```

#### 5.3 部署验证清单

| 检查项 | 命令/URL | 状态 |
|--------|---------|------|
| 前台访问 | `http://IP/` | ☐ |
| 后台访问 | `http://IP/admin` | ☐ |
| 后台登录 | admin / 密码 | ☐ |
| 联系表单 | 提交测试 | ☐ |
| 数据持久化 | 重启后数据仍在 | ☐ |
| PM2 状态 | `pm2 list` | ☐ |
| Nginx 状态 | `sudo systemctl status nginx` | ☐ |

---

## 四、快速开始模板

### 用户只需要提供

```markdown
# 新项目需求

1. **项目名称**: XXX 官网
2. **参考网站**: https://example.com
3. **页面需求**:
   - 首页（大图 + 服务介绍）
   - 关于我们
   - 产品展示
   - 联系表单
4. **后台需求**:
   - 产品管理
   - 留言查看
5. **文案**: [附件或粘贴]
6. **服务器**: 阿里云轻量（新购）
```

### 我自动执行的标准动作

1. **确认需求** → 2. **设计稿** → 3. **开发** → 4. **测试** → 5. **部署**

每个阶段输出:
- 设计阶段: 截图
- 开发阶段: 代码
- 部署阶段: 访问地址

---

## 五、沟通规范

### 5.1 用户反馈格式

**设计确认**:
```
首页: ✓ 确认 / ✗ 修改意见: ___
关于页: ✓ 确认 / ✗ 修改意见: ___
```

**Bug 反馈**:
```
问题: ___
复现步骤: 1. ___ 2. ___ 3. ___
期望结果: ___
实际结果: ___
截图: [附件]
```

### 5.2 我主动汇报节点

| 节点 | 汇报内容 |
|------|---------|
| 设计完成 | 截图 + 设计说明 |
| 开发完成 | 功能清单 + 测试视频/截图 |
| 部署完成 | 访问地址 + 账号密码 + 操作手册 |

---

## 六、技术栈标准

### 默认技术栈（推荐）

| 层级 | 技术 | 选型理由 |
|------|------|---------|
| 前端 | Next.js 14 + Tailwind | SSR、SEO、Apple 风格易实现 |
| 后台 | React + Vite | 轻量、热更新快 |
| 后端 | Express + Prisma | 简单、ORM 好用 |
| 数据库 | SQLite | 零配置、备份简单 |
| 部署 | PM2 + Nginx | 稳定、资源占用低 |
| 服务器 | 阿里云轻量 1核2G | 性价比最高 |

### 替代方案

| 场景 | 替代技术 |
|------|---------|
| 高并发 | PostgreSQL 替代 SQLite |
| 多实例 | Redis + JWT 分布式 |
| 容器化 | Docker + Docker Compose |
| Serverless | Vercel + Supabase |

---

## 七、交付物清单

项目完成后，用户获得:

```
project/
├── src/                    # 完整源代码
├── docs/
│   ├── DEPLOYMENT_GUIDE.md # 部署文档
│   ├── USER_MANUAL.md      # 使用手册
│   └── API_DOCUMENT.md     # API 文档
├── deploy/
│   ├── nginx.conf          # Nginx 配置
│   └── deploy.sh           # 一键部署脚本
├── .env.example            # 环境变量示例
├── .gitignore              # Git 忽略配置
└── README.md               # 项目说明（含 Git 仓库地址）
```

**Git 仓库**
- GitHub/GitLab 仓库链接
- 完整的提交历史
- 部署和使用说明

---

## 八、价格参考

| 项目 | 价格 | 备注 |
|------|------|------|
| 阿里云轻量服务器 | ¥24/月 | 1核2G，足够 |
| 域名 | ¥30-80/年 | .cn 或 .com |
| 开发费用 | 按需求评估 | 参考: 企业官网 ¥3000-8000 |
| 维护费用 | 年费的 10-20% | 或按需付费 |

---

## 附录：常见问题 FAQ

**Q: 从需求到上线要多久？**
A: 标准企业官网 1-2 周，电商/复杂系统 2-4 周。

**Q: 可以修改设计吗？**
A: 设计阶段可无限修改，开发阶段小修改免费，大修改评估工时。

**Q: 服务器谁买？**
A: 用户自行购买（我提供指导），或委托我代买。

**Q: 后续维护怎么做？**
A: 提供 3 个月免费 Bug 修复，之后按年签维护合同或按次收费。

**Q: 源码交付吗？**
A: 完整源码交付，包含部署文档，可自行维护或找其他开发者。

**Q: 代码放在哪里？**
A: 使用 Git 版本控制，代码托管在 GitHub/GitLab，你拥有完整访问权限。

**Q: 如何更新网站内容？**
A: 方式1: 登录后台自助更新（新闻、产品等）；方式2: 提供内容给我，我通过 Git 推送更新。

**Q: 如何备份网站数据？**
A: Git 自动备份代码；数据库可配置自动备份脚本，定期备份到云存储。

---

---

## 附录 B: 部署问题复盘与改进 (2026-03-23)

### B.1 今日部署问题实录

#### 问题链时间线

```
09:00  开始部署
       ↓ 发现 SSH 连接失败
09:15  Permission denied (publickey)
       ↓ 排查：阿里云密钥对已绑定，但本地无私钥
09:30  用户提供公钥，但我需要私钥文件
       ↓ 查找本地密钥文件
09:45  找到 ~/.ssh/deploy-key.pem
       ↓ 配置 SSH config
10:00  SSH 连接成功
       ↓ 同步文件，启动服务
10:15  发现后台 500 错误
       ↓ 排查：backend 服务未启动
10:30  启动 backend，PM2 状态正常
       ↓ 访问 /admin/ 500 错误
10:45  排查：admin/dist 不存在（未构建）
       ↓ 本地构建 admin
11:00  缺少 tsconfig.json，构建失败
       ↓ 创建 tsconfig.json 和 tsconfig.node.json
11:15  构建成功，同步到服务器
       ↓ 访问 /admin/ 循环重定向
11:30  排查：Nginx try_files 配置错误
       ↓ 修复 Nginx 配置
11:45  全部服务正常，HTTP 200
```

### B.2 核心问题详细分析

#### 问题 1: SSH 密钥对配置不完整

**现象**:
```bash
ssh root@47.236.193.197
Permission denied (publickey).
```

**原因**:
- 阿里云控制台已绑定密钥对
- 服务器已重启
- 但本地 `~/.ssh/config` 未配置私钥路径
- 导致 SSH 默认使用 id_rsa，而非 deploy-key.pem

**解决**:
```bash
# 1. 确认私钥文件存在
ls ~/.ssh/deploy-key.pem

# 2. 配置 SSH config
cat > ~/.ssh/config << 'EOF'
Host indigenex-server
    HostName 47.236.193.197
    User root
    IdentityFile ~/.ssh/deploy-key.pem
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

# 3. 测试连接
ssh indigenex-server
```

**教训**:
- 密钥对部署必须三步：控制台创建+绑定、服务器重启、本地配置私钥
- 缺一不可！

---

#### 问题 2: 服务启动不完整

**现象**:
- 前台正常 (http://IP/)
- 后台 500 错误 (http://IP/admin/)
- API 无响应 (http://IP/api/xxx)

**原因**:
```bash
pm2 status
# 只显示了 indigenex-frontend，没有 backend！
```
- deploy.sh 只部署了 frontend
- backend 服务未启动
- admin 未构建

**解决**:
```bash
# 1. 启动 backend
cd /var/www/indigenex-website/backend
pm2 start server.js --name "indigenex-backend"

# 2. 构建 admin
cd /var/www/indigenex-website/admin
npm run build  # 需要先创建 tsconfig.json

# 3. 保存 PM2 配置
pm2 save
```

**改进后的 deploy.sh**:
```bash
#!/bin/bash
# deploy.sh - 完整部署脚本

# 1. 构建并部署 frontend
cd frontend && npm run build
cd .. && rsync -avz frontend/ server:/var/www/frontend/

# 2. 部署 backend（只同步，不构建）
rsync -avz backend/ server:/var/www/backend/
ssh server "cd /var/www/backend && pm2 restart indigenex-backend"

# 3. 构建并部署 admin
cd admin && npm run build
cd .. && rsync -avz admin/dist/ server:/var/www/admin/dist/
```

---

#### 问题 3: admin 缺少 tsconfig.json

**现象**:
```bash
cd admin && npm run build
> tsc && vite build
tsc: error TS5083: Cannot read file '/tsconfig.json'
```

**原因**:
- 项目初始化时未创建 tsconfig.json
- 之前可能在其他目录运行，依赖全局配置

**解决**:
```bash
# 创建 tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
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
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# 创建 tsconfig.node.json
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

---

#### 问题 4: Nginx 循环重定向

**现象**:
- 访问 `/admin/` 返回 500
- Nginx error log:
```
rewrite or internal redirection cycle while internally redirecting to "/admin/index.html"
```

**原因**:
```nginx
# ❌ 错误配置
location /admin {
    alias /var/www/admin/dist/;
    try_files $uri $uri/ /admin/index.html;  # 循环！
}
```
- `try_files /admin/index.html` 匹配到 `location /admin`
- 再次进入同一个 location，无限循环

**解决**:
```nginx
# ✅ 正确配置
server {
    # Admin 静态资源（必须最前）
    location /admin/assets/ {
        alias /var/www/admin/dist/assets/;
        expires 30d;
    }

    # 重定向 /admin 到 /admin/
    location = /admin {
        return 301 /admin/;
    }

    # Admin 主配置
    location /admin/ {
        alias /var/www/admin/dist/;
        index index.html;
        try_files $uri $uri/ =404;  # 不使用 /admin/index.html
    }
}
```

### B.3 改进建议

#### 1. deploy.sh 必须完整

```bash
#!/bin/bash
# deploy-complete.sh - 完整部署脚本

set -e

echo "=== 完整部署 ==="

# 检查 SSH
if ! ssh indigenex-server "echo OK" > /dev/null 2>&1; then
    echo "❌ SSH 连接失败，请检查密钥配置"
    exit 1
fi

# 1. Frontend
echo "[1/4] 部署 Frontend..."
cd frontend && npm run build && cd ..
rsync -avz frontend/ indigenex-server:/var/www/frontend/

# 2. Backend
echo "[2/4] 部署 Backend..."
rsync -avz backend/ indigenex-server:/var/www/backend/
ssh indigenex-server "cd /var/www/backend && npm install && pm2 restart indigenex-backend || pm2 start server.js --name indigenex-backend"

# 3. Admin
echo "[3/4] 部署 Admin..."
cd admin
if [ ! -f "tsconfig.json" ]; then
    echo "⚠️ 缺少 tsconfig.json，请检查项目配置"
    exit 1
fi
npm run build
cd ..
rsync -avz admin/dist/ indigenex-server:/var/www/admin/dist/

# 4. 验证
echo "[4/4] 验证服务..."
sleep 3
HTTP_FRONT=$(curl -s -o /dev/null -w "%{http_code}" http://47.236.193.197/)
HTTP_ADMIN=$(curl -s -o /dev/null -w "%{http_code}" http://47.236.193.197/admin/)

echo "前台: HTTP $HTTP_FRONT"
echo "后台: HTTP $HTTP_ADMIN"

if [ "$HTTP_FRONT" = "200" ] && [ "$HTTP_ADMIN" = "200" ]; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署可能有问题，请检查日志"
    ssh indigenex-server "pm2 status"
fi
```

#### 2. 项目初始化检查清单

创建 `init-checklist.sh`:
```bash
#!/bin/bash
echo "=== 项目初始化检查 ==="

# Frontend
cd frontend
[ -f "next.config.js" ] && echo "✅ next.config.js" || echo "❌ next.config.js"
cd ..

# Backend
cd backend
[ -f "server.js" ] && echo "✅ server.js" || echo "❌ server.js"
[ -f "prisma/schema.prisma" ] && echo "✅ schema.prisma" || echo "❌ schema.prisma"
cd ..

# Admin
cd admin
[ -f "tsconfig.json" ] && echo "✅ tsconfig.json" || echo "❌ tsconfig.json"
[ -f "vite.config.ts" ] && echo "✅ vite.config.ts" || echo "❌ vite.config.ts"
grep -q "base: '/admin/'" vite.config.ts && echo "✅ vite base 配置" || echo "❌ vite base 未配置"
cd ..

echo ""
echo "SSH 配置检查:"
[ -f "$HOME/.ssh/deploy-key.pem" ] && echo "✅ 私钥存在" || echo "❌ 私钥不存在"
[ -f "$HOME/.ssh/config" ] && grep -q "indigenex-server" "$HOME/.ssh/config" && echo "✅ SSH config" || echo "❌ SSH config 未配置"
```

#### 3. 标准化部署流程 V2.0

```
部署前（本地）:
  ☐ 运行 init-checklist.sh 检查项目配置
  ☐ 确认 SSH 免密登录: ssh indigenex-server
  ☐ 本地测试: npm run build (frontend/admin)
  ☐ 提交代码到 Git

部署中（自动）:
  ☐ ./deploy-complete.sh
  ☐ 检查输出: HTTP 200

部署后（验证）:
  ☐ 前台: http://IP/ ✓
  ☐ 后台: http://IP/admin/ ✓
  ☐ 登录: admin/密码 ✓
  ☐ API: http://IP/api/news (401 正常) ✓
  ☐ PM2: ssh indigenex-server 'pm2 status' ✓
```

---

### B.4 关键教训

1. **SSH 密钥对三步走**：创建→绑定→配置，缺一不可
2. **deploy.sh 必须完整**：frontend + backend + admin，不能只部署一个
3. **tsconfig.json 必须存在**：admin 构建前检查
4. **Nginx 配置要小心**：try_files 可能导致循环重定向
5. **验证要全面**：前台+后台+API+PM2 状态全部检查

---

### B.5 服务器重启自动启动配置（2026-03-23 新增）

#### 问题背景
服务器重启后，所有服务停止，需要手动启动，严重影响网站可用性。

#### 解决方案：三层自动恢复机制

**1. Systemd 开机自启**
```bash
# PM2 开机自启
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

# Nginx 开机自启
systemctl enable nginx
```

**2. PM2 进程守护**
```bash
# 保存进程列表
pm2 save

# 重启后自动恢复
pm2 resurrect
```

**3. 健康检查定时任务（每分钟）**
```bash
# /root/health-check.sh
cat > /root/health-check.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/health-check.log"

# 检查 frontend
if ! pgrep -f "next-server" > /dev/null; then
    echo "$(date): frontend未运行，启动..." >> $LOG_FILE
    cd /var/www/indigenex-website/frontend
    PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
fi

# 检查 backend
if ! pgrep -f "server.js" > /dev/null; then
    echo "$(date): backend未运行，启动..." >> $LOG_FILE
    cd /var/www/indigenex-website/backend
    pm2 start server.js --name "indigenex-backend"
fi

# 检查 Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx未运行，启动..." >> $LOG_FILE
    systemctl start nginx
fi

pm2 save >> $LOG_FILE 2>&1
EOF

chmod +x /root/health-check.sh

# 添加到 crontab
echo "* * * * * /root/health-check.sh > /dev/null 2>&1" | crontab -
```

#### 验证自动启动
```bash
# 重启服务器
ssh indigenex-server "reboot"

# 等待 2 分钟后检查
ssh indigenex-server "pm2 status"
# 应显示: indigenex-frontend ● online
#         indigenex-backend  ● online
```

---

### B.6 静态图片资源处理（2026-03-23 新增）

#### 问题 1: Admin Logo 显示异常

**现象**:
- 后台管理页面 Logo 无法显示
- 浏览器控制台显示 404 或路径错误

**原因**:
```javascript
// ❌ 错误：绝对路径，指向根目录
<img src="/logo.png" />
// 实际访问: http://47.236.193.197/logo.png (404)

// ✅ 正确：相对路径，基于 base URL
<img src="logo.png" />
// 实际访问: http://47.236.193.197/admin/logo.png (200)
```

**Vite 配置**:
```javascript
// admin/vite.config.ts
export default defineConfig({
  base: '/admin/',  // 所有相对路径基于此
  // ...
})
```

**修复步骤**:
```bash
# 1. 修改代码中的 Logo 引用
cd admin/src
sed -i 's|src="/logo.png"|src="logo.png"|g' pages/Login.tsx
sed -i 's|src="/logo.png"|src="logo.png"|g' components/Layout.tsx

# 2. 重新构建
cd ../admin
npm run build

# 3. 同步到服务器
rsync -avz dist/ server:/var/www/indigenex-website/admin/dist/
```

#### 问题 2: Nginx 静态资源配置

**Nginx 配置（支持 Logo 和其他静态资源）**:
```nginx
server {
    listen 80;

    # Admin 静态资源（必须在前）
    location /admin/assets/ {
        alias /var/www/admin/dist/assets/;
        expires 30d;
    }

    # Admin Logo 单独配置
    location /admin/logo.png {
        alias /var/www/admin/dist/logo.png;
    }

    # 其他静态图片
    location /admin/images/ {
        alias /var/www/admin/dist/images/;
        expires 30d;
    }

    # Admin SPA 主配置
    location /admin {
        alias /var/www/admin/dist/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 前台网站
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5001;
    }
}
```

#### 静态资源部署检查清单

```bash
# 1. 检查本地构建产物
ls admin/dist/logo.png
ls admin/dist/assets/

# 2. 检查服务器文件
ssh indigenex-server "ls -la /var/www/indigenex-website/admin/dist/"

# 3. 测试访问
curl -I http://47.236.193.197/admin/logo.png
# 应返回: HTTP/1.1 200 OK

# 4. 浏览器验证
# 打开 http://47.236.193.197/admin/login
# 确认 Logo 正常显示
```

#### 常见静态资源问题速查

| 问题 | 现象 | 解决方案 |
|------|------|----------|
| Logo 404 | 图片不显示 | 检查路径是相对还是绝对 |
| 图片路径错误 | 指向根目录 | 修改为相对路径 `logo.png` |
| Nginx 403 | 权限错误 | `chmod 644 logo.png` |
| 缓存问题 | 更新后仍显示旧图 | 加版本号 `logo.png?v=2` |
| 构建缺失 | dist 中没有图片 | 检查图片是否在 public/ 目录 |

---

### B.7 完整部署流程 V3.0（含自动启动和静态资源）

```
部署前检查:
  ☐ init-checklist.sh 通过
  ☐ SSH 免密: ssh indigenex-server
  ☐ 本地构建: frontend √, admin √
  ☐ 静态资源: logo.png 在 dist/ 中

部署执行:
  ☐ ./deploy-complete.sh

部署后验证:
  ☐ 前台: http://IP/ → 200
  ☐ 后台: http://IP/admin/ → 200
  ☐ Logo: http://IP/admin/logo.png → 200
  ☐ 登录: 输入账号密码 → 成功
  ☐ PM2: 2个服务 online
  ☐ 自动启动: systemctl is-enabled pm2-root → enabled

重启测试:
  ☐ 服务器重启 → 等待2分钟
  ☐ 再次验证所有服务自动恢复
```

> 文档版本: 1.4
> 最后更新: 2026-03-23
> 基于项目: Carggo GM 全流程经验
> 更新内容: v1.4 新增自动启动配置和静态图片处理方案
