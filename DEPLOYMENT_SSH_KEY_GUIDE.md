# SSH 密钥对部署优化指南

> 基于阿里云轻量服务器密钥对管理，解决部署中的 SSH 连接问题

---

## 一、之前部署遇到的问题总结

### 1.1 问题清单

| 序号 | 问题描述 | 发生阶段 | 影响 |
|------|----------|----------|------|
| 1 | `Permission denied (publickey)` | SSH 连接 | 无法免密登录 |
| 2 | `Permission denied (password)` | SSH 连接 | 密码登录被禁用 |
| 3 | `EACCES: permission denied` | npm install | 目录权限不足 |
| 4 | `Cannot find module '../server/require-hook'` | 启动服务 | node_modules 损坏 |
| 5 | `Prisma binary target mismatch` | 构建阶段 | 跨平台原生模块不兼容 |
| 6 | 构建卡住不动 | 构建阶段 | 服务器内存不足 |
| 7 | PM2 状态 `errored` | 启动阶段 | 进程反复崩溃 |

### 1.2 根本原因分析

```
问题链：
1. 服务器禁用了 root 密码登录
   → 必须使用 SSH 密钥
   → 但本地密钥未添加到服务器的 authorized_keys
   → 导致 Permission denied

2. scp 上传 node_modules
   → 包含 Mac 原生模块 (darwin-arm64/x64)
   → 服务器是 Linux (debian-openssl)
   → 模块加载失败

3. 服务器 1核2G 内存
   → Next.js 构建需要 >2GB 内存
   → OOM 导致构建卡住
```

---

## 二、阿里云密钥对配置（正确姿势）

### 2.1 阿里云控制台配置

**步骤 1: 创建密钥对**
1. 登录阿里云控制台 → 轻量应用服务器 → 密钥对
2. 创建密钥对 → 输入名称（如 `deploy-key`）
3. **选择「下载私钥」**（仅一次机会，务必保存）
4. 文件会保存为 `deploy-key.pem`

**步骤 2: 绑定密钥对到服务器**
1. 进入密钥对列表 → 找到 `deploy-key`
2. 点击「绑定密钥对」
3. 选择目标服务器 → 确认绑定
4. **重启服务器**（绑定后必须重启才生效）

**步骤 3: 本地配置私钥**
```bash
# 1. 将下载的私钥移动到 .ssh 目录
mv ~/Downloads/deploy-key.pem ~/.ssh/

# 2. 设置权限（必须 600，否则 SSH 会拒绝）
chmod 600 ~/.ssh/deploy-key.pem

# 3. 添加到 SSH agent
ssh-add ~/.ssh/deploy-key.pem
```

### 2.2 本地 SSH 配置文件

创建/编辑 `~/.ssh/config`：

```
# 阿里云轻量服务器
Host indigenex
    HostName 47.236.193.197
    User root
    IdentityFile ~/.ssh/deploy-key.pem
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

# 如果使用普通用户
Host indigenex-admin
    HostName 47.236.193.197
    User admin
    IdentityFile ~/.ssh/deploy-key.pem
    StrictHostKeyChecking no
```

**测试连接**:
```bash
ssh indigenex
# 应该无需密码直接登录
```

---

## 三、免密部署脚本（优化版）

### 3.1 本地构建 + rsync 部署（推荐）

**优势**:
- 本地构建避免服务器内存不足
- rsync 增量同步，速度快
- 自动排除 node_modules，避免跨平台问题

```bash
#!/bin/bash
# deploy-with-key.sh - 密钥部署脚本

set -e

SERVER_IP="47.236.193.197"
SERVER_USER="root"
KEY_FILE="$HOME/.ssh/deploy-key.pem"
PROJECT_DIR="/var/www/indigenex-website"

echo "=== 开始部署到 $SERVER_IP ==="

# 1. 本地构建
echo "[1/4] 本地构建..."
cd /Users/ligang/New/indigenex-website/frontend
rm -rf .next
npm run build

# 2. 使用 rsync 同步（排除 node_modules）
echo "[2/4] 同步文件到服务器..."
rsync -avz --delete \
  -e "ssh -i $KEY_FILE" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  /Users/ligang/New/indigenex-website/ \
  $SERVER_USER@$SERVER_IP:$PROJECT_DIR/

# 3. 服务器端安装依赖并启动
echo "[3/4] 服务器端配置..."
ssh -i $KEY_FILE $SERVER_USER@$SERVER_IP << 'REMOTE_EOF'
  cd /var/www/indigenex-website/frontend

  # 确保目录权限正确
  chown -R root:root /var/www/indigenex-website

  # 安装生产依赖（Linux 原生模块）
  npm install --production

  # 重启 PM2
  pm2 delete indigenex-frontend 2>/dev/null || true
  PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
  pm2 save

  echo "部署状态:"
  pm2 status
REMOTE_EOF

echo "[4/4] 部署完成！"
echo "访问: http://$SERVER_IP/"
```

### 3.2 使用 Git + Webhook 自动部署（高级）

**架构**:
```
本地开发 → GitHub → 服务器 Webhook → 自动拉取 → 自动构建
```

**服务器配置**:
```bash
# 1. 服务器上克隆仓库（使用 Deploy Key）
cd /var/www
git clone git@github.com:yourusername/indigenex-website.git

# 2. 配置 deploy key
ssh-keygen -t rsa -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub  # 添加到 GitHub Deploy Keys

# 3. 配置 SSH 使用特定 key
cat >> ~/.ssh/config << EOF
Host github.com
    IdentityFile ~/.ssh/github_deploy_key
EOF

# 4. 创建自动部署脚本
cat > /var/www/deploy-hook.sh << 'EOF'
#!/bin/bash
cd /var/www/indigenex-website
git pull origin main
cd frontend && npm install && npm run build
pm2 restart indigenex-frontend
EOF

chmod +x /var/www/deploy-hook.sh
```

---

## 四、跨平台问题根治方案

### 4.1 问题根源

Mac 开发 ↔ Linux 部署，原生模块不兼容：
- Mac: `@next/swc-darwin-arm64`
- Linux: `@next/swc-linux-x64-gnu`

### 4.2 解决方案

**方案 A: 本地构建，只传构建产物（推荐）**
```bash
# 本地
npm run build  # 生成 .next/
rsync -avz .next/ server:/var/www/frontend/.next/
```

**方案 B: 服务器上强制重新安装**
```bash
# 服务器上执行
rm -rf node_modules package-lock.json
npm install  # 安装 Linux 版本
```

**方案 C: 使用 Docker（彻底解决跨平台）**
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 五、服务器内存不足解决

### 5.1 问题
Next.js 构建需要 ~2GB 内存，阿里云 1核2G 服务器经常 OOM。

### 5.2 解决方案

**方案 1: 本地构建**
```bash
# 本地构建（Mac 内存充足）
npm run build

# 只上传构建产物
rsync -avz .next/ server:/var/www/frontend/.next/
rsync -avz public/ server:/var/www/frontend/public/
rsync package.json server:/var/www/frontend/

# 服务器只安装生产依赖
npm install --production
```

**方案 2: 增加 Swap（临时方案）**
```bash
# 服务器上执行
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 验证
free -h  # 查看 Swap 是否生效
```

**方案 3: 使用 Next.js 静态导出**
```javascript
// next.config.js
const nextConfig = {
  output: 'export',  // 静态导出，不需要服务器运行
  distDir: 'dist',
}
module.exports = nextConfig
```
静态导出后，用 Nginx 直接托管 HTML 文件，无需 PM2。

---

## 六、完整部署检查清单

### 6.1 前置条件检查
```bash
□ 阿里云密钥对已创建并下载
□ 密钥对已绑定到服务器
□ 服务器已重启（绑定后必须）
□ 本地私钥权限设置为 600
□ ~/.ssh/config 配置正确
□ ssh indigenex 可以免密登录
```

### 6.2 部署执行检查
```bash
□ 本地构建成功 (.next 目录生成)
□ rsync 同步成功（无权限错误）
□ 服务器 node_modules 正确安装
□ 没有 darwin 模块残留
□ PM2 启动成功（status: online）
□ 网站可正常访问
□ 移动端适配正常
```

### 6.3 故障排查速查

| 症状 | 诊断命令 | 解决方案 |
|------|----------|----------|
| SSH 连不上 | `ssh -v indigenex` | 检查密钥权限、config 配置 |
| 权限拒绝 | `ls -la ~/.ssh/` | `chmod 600` 私钥 |
| 模块错误 | `ls node_modules/\@next/` | 删除重装，排除 darwin |
| 构建卡住 | `free -h` | 本地构建或加 Swap |
| PM2 崩溃 | `pm2 logs --lines 50` | 查看日志，修复代码错误 |

---

## 七、推荐部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        本地开发环境                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Frontend   │    │    Admin     │    │   Backend    │   │
│  │  (Next.js)   │    │   (Vite)     │    │  (Express)   │   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
│         │                   │                   │            │
│         └───────────────────┼───────────────────┘            │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │   npm run build   │                      │
│                    └────────┬────────┘                       │
│                             │                                │
└─────────────────────────────┼────────────────────────────────┘
                              │ rsync -avz (SSH 密钥)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    阿里云轻量服务器                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Nginx (80/443)                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │   │
│  │  │  /       │  │ /admin/  │  │      /api/           │ │   │
│  │  │  3000    │  │  static  │  │      5001            │ │   │
│  │  │ Next.js  │  │  files   │  │    Express           │ │   │
│  │  │ (PM2)    │  │          │  │    (PM2)             │ │   │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

> 文档版本: 1.0
> 最后更新: 2026-03-23
> 针对问题: SSH 密钥部署、跨平台模块、内存不足
