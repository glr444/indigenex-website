# 本地与服务器版本同步清单

## 已同步文件（本地已更新）

### 配置文件
- [x] `backend/prisma/schema.prisma` - 添加 binaryTargets
- [x] `admin/vite.config.ts` - 添加 base: '/admin/'
- [x] `admin/src/main.tsx` - 添加 basename="/admin"
- [x] `admin/src/App.tsx` - 添加 catch-all 路由
- [x] `admin/src/components/ProtectedRoute.tsx` - 修复 TypeScript 错误
- [x] `admin/src/contexts/AuthContext.tsx` - 移除未使用的 React 导入
- [x] `admin/src/pages/contact/ContactDetail.tsx` - 移除未使用的 User 导入

### 部署文件（新增）
- [x] `deploy/nginx.conf` - Nginx 配置
- [x] `deploy/deploy.sh` - 一键部署脚本
- [x] `DEPLOYMENT_GUIDE.md` - 部署指南 v2.0
- [x] `STANDARD_WORKFLOW.md` - 标准化工作流程

## 服务器特有文件（无需同步到本地）

- [ ] `backend/.env` - 服务器环境变量（本地可创建 .env.example）
- [ ] `backend/prisma/dev.db` - 数据库文件
- [ ] `backend/node_modules/` - 依赖
- [ ] `frontend/node_modules/` - 依赖
- [ ] `admin/node_modules/` - 依赖
- [ ] `frontend/.next/` - 构建输出
- [ ] `admin/dist/` - 构建输出

## 同步方法

### 方法1: 本地 → 服务器（更新代码后）
```bash
# 本地执行
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='dist' \
  /Users/ligang/New/indigenex-website/ \
  admin@47.236.193.197:/var/www/indigenex-website/

# 然后服务器上重新构建
cd /var/www/indigenex-website
./deploy/deploy.sh
```

### 方法2: 服务器 → 本地（紧急修复后）
```bash
# 本地执行
rsync -avz admin@47.236.193.197:/var/www/indigenex-website/admin/src/ \
  /Users/ligang/New/indigenex-website/admin/src/
```

## 版本号标记

- 本地版本: v1.0.0-synced
- 服务器版本: v1.0.0-deployed
- 同步时间: 2026-03-22

## 下次部署前检查

- [ ] 本地所有修改已保存
- [ ] admin/vite.config.ts 有 base: '/admin/'
- [ ] admin/src/main.tsx 有 basename="/admin"
- [ ] 运行本地测试通过
- [ ] 已备份服务器数据库（如有重要数据）
