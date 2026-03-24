# Indigenex Website - 部署修复总结

## 修复的问题

### 1. 前端样式丢失问题
**问题原因**:
- nginx 配置中前端路径指向错误的目录 `frontend-dist/server/app`
- 实际构建输出在 `dist` 目录

**修复内容**:
- 更新 `nginx-config` 中 root 路径为 `/var/www/indigenex-website/frontend/dist`
- 添加静态资源缓存头优化加载速度

### 2. 后端登录 Internal Server Error
**问题原因**:
- 服务器上后端缺少 `.env` 文件
- DATABASE_URL 环境变量未设置导致 Prisma 无法连接数据库

**修复内容**:
- 创建 `setup-server.sh` 脚本自动配置后端环境
- 部署脚本会自动创建 `.env` 文件

### 3. 登录页面 API 地址错误
**问题原因**:
- `frontend/app/portal/login/page.tsx` 中硬编码了 `http://localhost:5001/api/member/auth/login`
- 生产环境应该使用相对路径 `/api/member/auth/login`

**修复内容**:
- 修改 API URL 为相对路径 `/api/member/auth/login`

### 4. 登录页面背景图片缺失
**问题原因**:
- 登录页面引用了不存在的 `/images/qingming-bg.png`

**修复内容**:
- 使用 CSS 渐变背景替代图片
- 新的背景色: `linear-gradient(135deg, #1e3a5f 0%, #2d5a87 30%, #4a7c9b 60%, #6b9eb8 100%)`
- 添加装饰性圆形和网格纹理增强视觉效果

### 5. nginx 配置端口错误
**问题原因**:
- nginx 代理后端 API 使用端口 5000
- 实际后端运行在端口 5001

**修复内容**:
- 修改 `proxy_pass` 为 `http://localhost:5001`

## 文件变更列表

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `nginx-config` | 修改 | 修正前端路径、API端口、添加缓存头 |
| `frontend/app/portal/login/page.tsx` | 修改 | 修复API地址和背景样式 |
| `build-local.sh` | 修改 | 更新构建脚本，正确复制dist目录 |
| `setup-server.sh` | 新增 | 服务器环境配置脚本 |

## 部署包位置

```
/Users/ligang/New/indigenex-website/deploy/indigenex-release.tar.gz (511KB)
```

## 部署步骤

### 方法1: 全自动部署 (推荐)

```bash
# 1. 上传部署包到服务器
scp /Users/ligang/New/indigenex-website/deploy/indigenex-release.tar.gz root@47.236.193.197:/tmp/

# 2. 执行部署脚本
ssh root@47.236.193.197 'bash -s' < /Users/ligang/New/indigenex-website/deploy/deploy-server.sh

# 3. 登录服务器配置nginx和启动服务
ssh root@47.236.193.197
```

### 方法2: 手动部署

```bash
# 1. 上传到服务器
scp /Users/ligang/New/indigenex-website/deploy/indigenex-release.tar.gz root@47.236.193.197:/tmp/

# 2. SSH登录服务器
ssh root@47.236.193.197

# 3. 解压部署包
cd /var/www
rm -rf indigenex-website
mkdir indigenex-website
tar xzvf /tmp/indigenex-release.tar.gz -C indigenex-website

# 4. 配置后端环境
cd /var/www/indigenex-website/backend
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="prod-jwt-secret"
JWT_EXPIRES_IN="7d"
MEMBER_JWT_SECRET="prod-member-jwt-secret"
MEMBER_JWT_EXPIRES_IN="7d"
PORT=5001
NODE_ENV=production
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="Ab1234567"
EOF

# 5. 安装后端依赖
npm ci --production
npx prisma generate

# 6. 配置nginx
cp /var/www/indigenex-website/nginx-config /etc/nginx/sites-available/indigenex
ln -sf /etc/nginx/sites-available/indigenex /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 7. 启动后端服务
pm2 start /var/www/indigenex-website/backend/server.js --name indigenex-backend

# 8. 检查服务状态
curl http://localhost:5001/health
```

## 部署后验证清单

- [ ] 访问 http://47.236.193.197 首页正常显示
- [ ] 页面样式正确加载 (无样式丢失)
- [ ] 导航栏可见且可点击
- [ ] 访问 http://47.236.193.197/portal/login/ 登录页面正常
- [ ] 登录页面左侧显示蓝色渐变背景
- [ ] 登录表单可正常输入
- [ ] 调用 /api/member/auth/login 返回正常响应 (非500错误)
- [ ] 后端健康检查 curl http://localhost:5001/health 返回 ok

## 技术细节

### Next.js 构建输出
- 构建目录: `frontend/dist`
- CSS文件: `dist/_next/static/css/*.css`
- JS文件: `dist/_next/static/chunks/*.js`

### 后端服务
- 运行端口: 5001
- 数据库: SQLite (dev.db)
- 进程管理: PM2

### Nginx 配置要点
- 前端根目录: `/var/www/indigenex-website/frontend/dist`
- 静态资源缓存: 1年
- API代理: `localhost:5001`
