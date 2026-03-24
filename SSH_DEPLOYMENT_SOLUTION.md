# SSH密钥对部署完整解决方案

> 基于阿里云轻量服务器密钥对管理，彻底解决部署问题

---

## 一、之前部署失败的根本原因分析

### 1.1 问题链复盘

```
绑定密钥对后的问题链：
├─ 阿里云绑定密钥对 → 自动禁用root密码登录
├─ 未重启服务器 → 密钥对未生效
├─ 本地无对应私钥 → SSH权限拒绝(publickey)
├─ 被迫手动上传 → scp传输node_modules
├─ Mac→Linux跨平台 → 原生模块不兼容(darwin vs linux)
├─ 服务器内存2G → Next.js构建OOM卡住
└─ PM2启动失败 → 服务errored状态
```

### 1.2 核心问题清单

| 问题 | 现象 | 根本原因 | 解决方案 |
|------|------|----------|----------|
| SSH连不上 | `Permission denied (publickey)` | 密钥对未正确配置 | 按本文档配置密钥对 |
| 模块错误 | `Cannot find module '@next/swc-darwin-arm64'` | 上传了Mac原生模块 | 本地构建，只传`.next`目录 |
| 构建卡住 | `npm run build` 无响应 | 服务器内存不足(2G) | 本地构建或增加Swap |
| 权限错误 | `EACCES: permission denied` | 目录属主错误 | `chown -R root:root` |
| PM2崩溃 | `status: errored` | 上述问题导致 | 修复后重启 |

---

## 二、阿里云密钥对配置（标准流程）

### 2.1 控制台操作步骤

**步骤1：创建密钥对**
1. 访问 [轻量应用服务器控制台-密钥对](https://swasnext.console.aliyun.com/keyPairs/)
2. 单击「创建密钥对」
3. 参数设置：
   - **密钥对名称**：`deploy-key`（或自定义）
   - **创建类型**：自动创建密钥对
4. **⚠️ 重要**：私钥会自动下载（`deploy-key.pem`），仅一次机会，妥善保存！

**步骤2：绑定密钥对到服务器**
1. 密钥对列表 → 找到`deploy-key` → 「绑定实例」
2. 选择目标服务器 → 确定
3. **⚠️ 必须重启服务器**：选择「立即重启实例」

**步骤3：验证密钥对生效**
```bash
# 重启后等待2-3分钟，测试SSH
ssh -i ~/.ssh/deploy-key.pem root@47.236.193.197
# 成功应直接登录，无需密码
```

### 2.2 本地SSH配置

**配置1：设置私钥权限（必须600）**
```bash
# 移动私钥到.ssh目录
mv ~/Downloads/deploy-key.pem ~/.ssh/

# 设置权限（必须，否则SSH拒绝）
chmod 600 ~/.ssh/deploy-key.pem

# 添加到SSH agent
ssh-add ~/.ssh/deploy-key.pem
```

**配置2：创建SSH配置文件**
```bash
cat > ~/.ssh/config << 'EOF'
# 阿里云轻量服务器 - 前台部署
Host indigenex
    HostName 47.236.193.197
    User root
    IdentityFile ~/.ssh/deploy-key.pem
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

# 备用：如果使用admin用户
Host indigenex-admin
    HostName 47.236.193.197
    User admin
    IdentityFile ~/.ssh/deploy-key.pem
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
```

**配置3：测试免密登录**
```bash
ssh indigenex
# 应该直接进入，无需输入密码
```

---

## 三、本地构建 + SSH部署（推荐方案）

### 3.1 为什么本地构建？

| 对比项 | 服务器构建 | 本地构建 |
|--------|-----------|----------|
| 内存需求 | 2GB+（易OOM） | Mac通常8GB+ |
| 构建速度 | 慢（1核CPU） | 快（多核） |
| 跨平台问题 | 需要重新安装依赖 | 构建产物跨平台 |
| 可靠性 | 低 | 高 |

### 3.2 一键部署脚本

```bash
#!/bin/bash
# deploy.sh - 本地构建 + SSH密钥部署

set -e

SERVER_IP="47.236.193.197"
SERVER_USER="root"
KEY_FILE="$HOME/.ssh/deploy-key.pem"
PROJECT_DIR="/var/www/indigenex-website"
LOCAL_DIR="/Users/ligang/New/indigenex-website"

echo "=== 部署到阿里云服务器 ==="
echo "服务器: $SERVER_IP"
echo ""

# 1. 前置检查
echo "[1/6] 检查SSH密钥..."
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ 错误: 密钥文件不存在: $KEY_FILE"
    echo "请从阿里云控制台下载密钥对私钥"
    exit 1
fi

# 测试SSH连接
if ! ssh -i "$KEY_FILE" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "echo 'SSH OK" 2>/dev/null; then
    echo "❌ 错误: SSH连接失败"
    echo "请检查:"
    echo "  1. 密钥对已绑定到服务器"
    echo "  2. 服务器已重启"
    echo "  3. 密钥文件权限为600"
    exit 1
fi
echo "✅ SSH连接正常"

# 2. 本地构建前台
echo ""
echo "[2/6] 本地构建前台..."
cd "$LOCAL_DIR/frontend"
rm -rf .next
npm run build
echo "✅ 构建完成"

# 3. 清理服务器上的node_modules（避免跨平台问题）
echo ""
echo "[3/6] 清理服务器node_modules..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" "
    cd $PROJECT_DIR/frontend 2>/dev/null && rm -rf node_modules .next || true
"
echo "✅ 清理完成"

# 4. 同步构建产物（排除node_modules）
echo ""
echo "[4/6] 同步文件到服务器..."
rsync -avz --delete \
    -e "ssh -i $KEY_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    "$LOCAL_DIR/" \
    "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/"
echo "✅ 同步完成"

# 5. 服务器端安装依赖并启动
echo ""
echo "[5/6] 服务器端配置..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" << 'REMOTE_EOF'
    set -e
    cd /var/www/indigenex-website/frontend

    # 设置目录权限
    chown -R root:root /var/www/indigenex-website

    # 安装生产依赖（Linux原生模块）
    echo "安装依赖..."
    npm install --production 2>&1 | tail -5

    # 确保.next目录存在
    if [ ! -d ".next" ]; then
        echo "❌ 错误: .next目录不存在"
        exit 1
    fi

    # 重启PM2
    echo "启动服务..."
    pm2 delete indigenex-frontend 2>/dev/null || true
    PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
    pm2 save

    echo ""
    echo "=== 服务状态 ==="
    pm2 status
REMOTE_EOF

echo ""
echo "[6/6] 部署完成！"
echo ""
echo "访问地址:"
echo "  前台: http://$SERVER_IP/"
echo "  后台: http://$SERVER_IP/admin"
echo ""
echo "常用命令:"
echo "  ssh indigenex                    # SSH登录"
echo "  ssh indigenex 'pm2 status'       # 查看服务状态"
echo "  ssh indigenex 'pm2 logs'         # 查看日志"
```

### 3.3 使用说明

```bash
# 1. 保存脚本
cd /Users/ligang/New/indigenex-website
# 将上述脚本保存为 deploy.sh

# 2. 添加执行权限
chmod +x deploy.sh

# 3. 执行部署
./deploy.sh

# 预期输出:
# === 部署到阿里云服务器 ===
# [1/6] 检查SSH密钥... ✅ SSH连接正常
# [2/6] 本地构建前台... ✅ 构建完成
# [3/6] 清理服务器node_modules... ✅ 清理完成
# [4/6] 同步文件到服务器... ✅ 同步完成
# [5/6] 服务器端配置... 安装依赖... 启动服务... ✅
# [6/6] 部署完成！
```

---

## 四、多密钥对配置（团队协作）

如果需要多人部署，可以在服务器上添加多个公钥：

```bash
# 1. 每个人生成自己的密钥对
ssh-keygen -t rsa -b 2048 -f ~/.ssh/my_deploy_key -N ""

# 2. 查看并复制公钥
cat ~/.ssh/my_deploy_key.pub
# 输出: ssh-rsa AAAAB3... user@macbook

# 3. 在服务器上添加（已有密钥登录后执行）
ssh indigenex
echo 'ssh-rsa AAAAB3... user@macbook' >> /root/.ssh/authorized_keys

# 4. 验证新密钥可以登录
ssh -i ~/.ssh/my_deploy_key root@47.236.193.197
```

---

## 五、故障排查手册

### 5.1 SSH连接问题

**问题**: `Permission denied (publickey)`

排查步骤：
```bash
# 1. 检查私钥文件权限
ls -la ~/.ssh/deploy-key.pem
# 应该是: -rw------- (600)
# 如果不是: chmod 600 ~/.ssh/deploy-key.pem

# 2. 检查SSH配置
cat ~/.ssh/config
# 确认HostName、User、IdentityFile正确

# 3. 使用verbose模式查看详情
ssh -v -i ~/.ssh/deploy-key.pem root@47.236.193.197

# 4. 检查服务器是否重启
# 阿里云控制台 → 轻量服务器 → 查看运行时间

# 5. 检查密钥对是否绑定
# 阿里云控制台 → 密钥对 → 查看绑定实例
```

### 5.2 部署后服务问题

**问题**: 网页打不开
```bash
# 1. 检查PM2状态
ssh indigenex 'pm2 status'
# 应该显示: indigenex-frontend ● online

# 2. 查看日志
ssh indigenex 'pm2 logs indigenex-frontend --lines 20'

# 3. 检查端口监听
ssh indigenex 'netstat -tlnp | grep 3000'

# 4. 检查防火墙
ssh indigenex 'ufw status'
# 或: iptables -L -n | grep 3000
```

**问题**: 移动端蒙版效果不生效
```bash
# 1. 检查构建产物
ssh indigenex 'grep -r "Mobile Menu Backdrop" /var/www/indigenex-website/frontend/.next/'

# 2. 如果没有，本地重新构建并重新部署
```

---

## 六、部署架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        本地开发环境 (Mac)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. npm run build (本地构建，内存充足)                     │   │
│  │  2. 生成 .next/ 目录 (跨平台兼容)                         │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │ rsync -avz (SSH密钥认证)                │
│                       │ 排除: node_modules, .git                │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              阿里云轻量服务器 (Ubuntu 22.04)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /var/www/indigenex-website/                            │   │
│  │  ├── frontend/                                          │   │
│  │  │   ├── .next/          ← 本地构建产物（已同步）         │   │
│  │  │   ├── public/                                        │   │
│  │  │   ├── package.json                                   │   │
│  │  │   └── node_modules/   ← 服务器npm install（Linux版）   │   │
│  │  │                                                     │   │
│  │  │   npm install --production                         │   │
│  │  │   pm2 start npm --name indigenex-frontend          │   │
│  │  └─────────────────────────────────────────────────────┘   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│  │  │  Nginx:80   │  │  PM2:3000   │  │  PM2:5001   │       │   │
│  │  │   前台网站   │  │  Next.js    │  │  Express    │       │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 七、快速检查清单

### 部署前检查
- [ ] 阿里云控制台已创建密钥对
- [ ] 密钥对已绑定到服务器
- [ ] 服务器已重启（绑定后）
- [ ] 本地私钥已保存到`~/.ssh/deploy-key.pem`
- [ ] 私钥权限为600
- [ ] `ssh indigenex`可以免密登录

### 部署中检查
- [ ] 本地构建成功（无错误）
- [ ] rsync同步成功（无权限错误）
- [ ] 服务器npm install成功
- [ ] PM2启动成功（status: online）

### 部署后验证
- [ ] http://47.236.193.197/ 前台可访问
- [ ] http://47.236.193.197/admin 后台可访问
- [ ] 移动端导航下拉蒙版效果正常
- [ ] 联系表单可正常提交

---

## 八、今日部署问题详细复盘 (2026-03-23)

### 8.1 完整时间线

```
09:00  用户: 部署完成，但移动端效果不在
       ↓ 检查服务器状态
09:15  发现: SSH Permission denied (publickey)
       ↓ 用户之前已绑定密钥对，但我本地未配置
09:30  用户提供公钥，但SSH需要私钥
       ↓ 查找本地私钥文件
09:45  找到 ~/.ssh/deploy-key.pem
       ↓ 创建 ~/.ssh/config 配置
10:00  SSH连接成功！
       ↓ 检查PM2状态
10:15  发现: 只有frontend在运行，backend未启动
       ↓ 用户SSH窗口已登录，手动启动backend
10:30  backend启动成功
       ↓ 测试/admin/访问
10:45  发现: admin/dist 不存在！
       ↓ 本地构建admin
11:00  构建失败: 缺少 tsconfig.json
       ↓ 创建 tsconfig.json 和 tsconfig.node.json
11:15  构建成功，rsync同步到服务器
       ↓ 测试/admin/访问
11:30  发现: Nginx 500错误，循环重定向
       ↓ 修复Nginx配置
11:45  全部服务正常！HTTP 200
```

### 8.2 核心教训与改进

#### 教训1: deploy.sh 不完整是根本原因

**原deploy.sh的问题**:
```bash
# ❌ 只部署了frontend！
rsync frontend/
pm2 start frontend
# backend? admin? 都没有！
```

**改进后的deploy-complete.sh**:
```bash
#!/bin/bash
set -e

echo "=== 完整部署 ==="

# 1. Frontend
echo "[1/3] Frontend..."
cd frontend && npm run build && cd ..
rsync -avz frontend/ server:/var/www/frontend/
ssh server "cd /var/www/frontend && pm2 restart indigenex-frontend"

# 2. Backend ⭐ 新增！
echo "[2/3] Backend..."
rsync -avz backend/ server:/var/www/backend/
ssh server "cd /var/www/backend && npm install && pm2 restart indigenex-backend"

# 3. Admin ⭐ 新增！
echo "[3/3] Admin..."
cd admin
[ -f tsconfig.json ] || { echo "❌ 缺少tsconfig.json"; exit 1; }
npm run build
cd ..
rsync -avz admin/dist/ server:/var/www/admin/dist/

# 4. 验证 ⭐ 新增！
echo "验证..."
curl -s http://IP/ | head -1
curl -s http://IP/admin/ | head -1
pm2 status
```

#### 教训2: 项目初始化检查缺失

**今日发生**:
- admin缺少tsconfig.json（构建失败）
- backend未启动（500错误）
- admin/dist不存在（500错误）

**改进: 创建 init-checklist.sh**
```bash
#!/bin/bash
echo "=== 项目初始化检查 ==="

# Admin配置
cd admin
[ -f tsconfig.json ] && echo "✅ tsconfig.json" || echo "❌ tsconfig.json"
[ -f vite.config.ts ] && grep -q "base: '/admin/'" vite.config.ts && echo "✅ vite base" || echo "❌ vite base"
cd ..

# SSH配置
[ -f ~/.ssh/deploy-key.pem ] && echo "✅ 私钥" || echo "❌ 私钥"
[ -f ~/.ssh/config ] && grep -q "indigenex-server" ~/.ssh/config && echo "✅ SSH config" || echo "❌ SSH config"

# 服务配置
cd backend
[ -f server.js ] && echo "✅ server.js" || echo "❌ server.js"
cd ..
```

#### 教训3: Nginx配置陷阱

**今日错误**:
```nginx
location /admin {
    try_files $uri $uri/ /admin/index.html;  # 循环重定向！
}
```

**正确配置**:
```nginx
location = /admin {
    return 301 /admin/;  # 统一带斜杠
}

location /admin/ {
    alias /var/www/admin/dist/;
    try_files $uri $uri/ =404;  # 不要写 /admin/index.html
}
```

### 8.3 标准部署流程 V2.0

```
部署前（本地检查）:
  □ ./init-checklist.sh 通过
  □ ssh indigenex-server "echo OK" 免密成功
  □ cd frontend && npm run build 本地构建成功
  □ cd admin && npm run build 本地构建成功
  □ git commit -m "部署前版本"

部署执行:
  □ ./deploy-complete.sh 一键部署
  □ 观察输出无错误

部署后验证（必须全部通过）:
  □ curl http://47.236.193.197/ → HTTP 200
  □ curl http://47.236.193.197/admin/ → HTTP 200
  □ curl http://47.236.193.197/api/news → 401（正常）
  □ ssh server 'pm2 status' → 2个online
  □ 手机访问 http://47.236.193.197/ 测试移动端
```

### 8.4 快速修复命令

如果部署后出现问题，执行：

```bash
# 1. SSH登录服务器
ssh indigenex-server

# 2. 检查服务状态
pm2 status

# 3. 如果backend缺失
cd /var/www/indigenex-website/backend
npm install
pm2 start server.js --name indigenex-backend

# 4. 如果admin缺失
cd /var/www/indigenex-website/admin
# 本地构建后同步
pm2 save

# 5. 检查Nginx
nginx -t
systemctl reload nginx

# 6. 如果Logo显示异常
# 检查代码中的路径: src="logo.png" (相对路径)
# 而非: src="/logo.png" (绝对路径)
```

---

## 九、服务器重启自动启动配置（生产环境必备）

### 9.1 问题描述
服务器重启（如系统更新、断电恢复）后，所有服务停止，网站无法访问。

### 9.2 三层自动恢复方案

#### 第一层：Systemd 开机自启
```bash
# 1. 配置 PM2 开机自启
pm2 startup systemd -u root --hp /root

# 2. 启用服务
systemctl enable pm2-root

# 3. 保存当前进程列表
pm2 save
```

**验证**:
```bash
systemctl is-enabled pm2-root
# 输出: enabled
```

#### 第二层：Nginx 开机自启
```bash
systemctl enable nginx

# 验证
systemctl is-enabled nginx
# 输出: enabled
```

#### 第三层：健康检查定时任务
每分钟检查一次服务状态，如有异常自动恢复。

```bash
# 创建健康检查脚本
cat > /root/health-check.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/health-check.log"
date >> "$LOG_FILE"

# 检查 frontend
if ! pgrep -f "next-server" > /dev/null; then
    echo "$(date): frontend未运行，启动..." >> "$LOG_FILE"
    cd /var/www/indigenex-website/frontend
    PORT=3000 pm2 start npm --name "indigenex-frontend" -- start
fi

# 检查 backend
if ! pgrep -f "server.js" > /dev/null; then
    echo "$(date): backend未运行，启动..." >> "$LOG_FILE"
    cd /var/www/indigenex-website/backend
    pm2 start server.js --name "indigenex-backend"
fi

# 检查 Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx未运行，启动..." >> "$LOG_FILE"
    systemctl start nginx
fi

pm2 save >> "$LOG_FILE" 2>&1
EOF

chmod +x /root/health-check.sh

# 添加到 crontab（每分钟执行）
echo "* * * * * /root/health-check.sh > /dev/null 2>&1" | crontab -

# 验证
crontab -l
```

### 9.3 验证自动启动
```bash
# 方法1: 查看当前 crontab
crontab -l

# 方法2: 模拟服务停止，观察自动恢复
ssh indigenex-server "pkill -f next-server; sleep 65; pm2 status"

# 方法3: 实际重启测试（非业务高峰时段）
ssh indigenex-server "reboot"

# 等待 2 分钟后检查
ssh indigenex-server "pm2 status; systemctl is-active nginx"
```

### 9.4 日志监控
```bash
# 查看健康检查日志
tail -f /var/log/health-check.log

# 查看 PM2 日志
pm2 logs

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

---

## 十、静态图片资源处理

### 10.1 常见静态资源问题

#### 问题1: Admin Logo 404
**现象**: 后台登录页 Logo 无法显示

**原因**: 代码中使用绝对路径 `/logo.png`，但服务部署在 `/admin/` 子目录下

**修复**:
```diff
<!-- Login.tsx -->
- <img src="/logo.png" />
+ <img src="logo.png" />

<!-- Layout.tsx -->
- <img src="/logo.png" />
+ <img src="logo.png" />
```

**Vite 配置**:
```javascript
// vite.config.ts
export default defineConfig({
  base: '/admin/',  // 相对路径基于此
  // ...
})
```

#### 问题2: 静态资源未同步
**现象**: 页面样式错乱，JS 加载失败

**原因**: 只同步了 `index.html`，未同步 `assets/` 目录

**解决**:
```bash
# 正确的 rsync 命令（包含所有静态资源）
rsync -avz admin/dist/ server:/var/www/admin/dist/

# 验证
curl http://server/admin/assets/index-xxx.js
```

### 10.2 Nginx 静态资源配置模板

```nginx
server {
    listen 80;
    server_name _;

    # 1. Admin 静态资源（优先级最高）
    location /admin/assets/ {
        alias /var/www/indigenex-website/admin/dist/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 2. Admin Logo
    location /admin/logo.png {
        alias /var/www/indigenex-website/admin/dist/logo.png;
        expires 7d;
    }

    # 3. 其他静态图片
    location /admin/images/ {
        alias /var/www/indigenex-website/admin/dist/images/;
        expires 30d;
    }

    # 4. Admin SPA 主配置
    location /admin {
        alias /var/www/indigenex-website/admin/dist/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 5. 前台网站 (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 6. API 转发到后端
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 10.3 静态资源检查清单

```bash
# 1. 本地检查
ls admin/dist/logo.png
ls admin/dist/assets/

# 2. 服务器检查
ssh indigenex-server "
    ls -la /var/www/indigenex-website/admin/dist/
    ls -la /var/www/indigenex-website/admin/dist/assets/
"

# 3. HTTP 检查
curl -I http://47.236.193.197/admin/logo.png
# 期望: HTTP/1.1 200 OK

curl -I http://47.236.193.197/admin/assets/index.js
# 期望: HTTP/1.1 200 OK

# 4. 浏览器验证
# 打开 http://47.236.193.197/admin/login
# 检查: Logo 正常显示，无 404 错误
```

### 10.4 静态资源问题速查

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| Logo 不显示 | 路径错误 | 改为相对路径 `logo.png` |
| 样式错乱 | CSS 未加载 | 检查 assets 目录同步 |
| 白屏 | JS 404 | 检查 base URL 配置 |
| 缓存旧版本 | 浏览器缓存 | 清除缓存或加版本号 |
| 403 Forbidden | 文件权限 | `chmod 644` 静态文件 |

---

## 十一、生产环境部署检查清单 V2.0

```markdown
## 部署前检查
- [ ] SSH 免密: ssh indigenex-server
- [ ] 本地构建: cd frontend && npm run build
- [ ] Admin构建: cd admin && npm run build
- [ ] 静态资源: ls admin/dist/logo.png
- [ ] 提交代码: git commit && git push

## 部署执行
- [ ] 运行: ./deploy-complete.sh
- [ ] 观察输出无错误

## 部署后验证
- [ ] 前台: curl http://IP/ → 200
- [ ] 后台: curl http://IP/admin/ → 200
- [ ] Logo: curl http://IP/admin/logo.png → 200
- [ ] API: curl http://IP/api/news → 401
- [ ] PM2: ssh indigenex-server 'pm2 status' → 2 online

## 自动启动验证
- [ ] PM2自启: systemctl is-enabled pm2-root → enabled
- [ ] Nginx自启: systemctl is-enabled nginx → enabled
- [ ] 健康检查: crontab -l 显示 health-check.sh

## 重启测试（重要）
- [ ] 重启服务器: ssh indigenex-server 'reboot'
- [ ] 等待2分钟
- [ ] 再次验证所有服务自动恢复
```

---

> 文档版本: 1.2
> 最后更新: 2026-03-23
> 适用: 阿里云轻量服务器 + SSH密钥对部署
> 关键改进:
>   v1.0 基础部署方案
>   v1.1 新增部署问题复盘
>   v1.2 新增自动启动配置和静态图片处理
