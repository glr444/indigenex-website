# API Key 功能部署问题总结

> 记录时间: 2026-03-27
> 问题现象: "创建API失败" / "Route not found"

---

## 问题概述

独立 API 授权管理功能在本地开发完成后，部署到服务器时出现 "创建API失败" 错误。经过排查，发现是**多个文件未同步到服务器**导致的连锁问题。

---

## 根因分析

### 1. 核心问题：server.js 未同步

**本地代码** ([backend/server.js](backend/server.js)) 已包含 API Key 路由：
```javascript
const adminApiKeyRoutes = require('./src/routes/adminApiKeys');
// ...
app.use('/api/admin/api-keys', adminApiKeyRoutes);
```

**服务器代码** (`/var/www/indigenex-website/backend/server.js`) 缺失上述路由注册，导致所有 `/api/admin/api-keys/*` 请求返回 404。

### 2. 历史遗留问题：PM2 运行了错误的路径

发现服务器上同时存在两个项目目录：
- `/var/www/indigenex/backend/` ← 旧的（PM2 之前运行的是这个）
- `/var/www/indigenex-website/backend/` ← 正确的（Git 仓库路径）

**影响**: 即使文件正确部署，PM2 可能加载的是旧目录的代码。

### 3. Prisma Schema 曾有问题（已修复）

- `ApiKey` 模型缺少 `description` 字段
- `memberId` 字段为必填，但创建时传了无效值 `'admin'`

**修复**:
- 添加 `description String?` 字段
- 将 `memberId` 改为可选 `String?`，系统级 API Key 设为 `null`

---

## 问题排查时间线

| 时间 | 排查内容 | 发现的问题 |
|------|----------|-----------|
| 阶段1 | 检查前端菜单不显示 | `zh.json` 缺少 `nav.apiKeys` 翻译 |
| 阶段2 | 检查 API 404 | PM2 运行了 `/var/www/indigenex/` 而非 `indigenex-website/` |
| 阶段3 | 重启服务后仍 404 | `server.js` 缺少 api-keys 路由导入和注册 |
| 阶段4 | 同步 server.js | 功能恢复正常 |

---

## 解决方案

### 立即修复

```bash
# 1. 同步 server.js
scp backend/server.js root@47.236.193.197:/var/www/indigenex-website/backend/server.js

# 2. 重启服务
pm2 restart indigenex-backend
```

### 长期改进

1. **部署流程规范化**
   - 部署前运行 `rsync` 或 `scp` 同步所有变更文件
   - 建立部署清单，包含关键文件检查

2. **PM2 配置确认**
   ```bash
   # 检查当前运行的脚本路径
   pm2 show indigenex-backend | grep "script path"

   # 确保指向正确目录
   pm2 start /var/www/indigenex-website/backend/server.js --name indigenex-backend
   pm2 save
   ```

3. **添加健康检查端点**
   新增 `/health/routes` 接口，返回已注册的路由列表，便于快速验证部署状态。

---

## 验证方法

```bash
# 测试创建 API Key
curl -X POST http://47.236.193.197/api/admin/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "测试", "description": "测试描述"}'

# 测试列表查询
curl http://47.236.193.197/api/admin/api-keys
```

**预期结果**: 返回 `{"success":true,...}`

---

## 教训总结

1. **文件同步要全面**: 不仅同步 `src/` 目录下的业务代码，`server.js`、`package.json` 等入口文件也要同步
2. **确认运行路径**: 使用 `pm2 show` 验证实际运行的代码路径
3. **Schema 变更后**: 需要运行 `prisma migrate dev` 或 `prisma db push` 更新数据库
4. **测试覆盖**: 部署后应立即测试关键功能，而不是等待用户反馈

---

## 相关文件清单

| 文件 | 变更内容 | 是否已同步 |
|------|----------|-----------|
| `backend/server.js` | 添加 api-keys 路由 | ✅ |
| `backend/prisma/schema.prisma` | ApiKey 模型添加 description 字段 | ✅ |
| `backend/src/routes/adminApiKeys.js` | API Key CRUD 接口 | ✅ |
| `admin/src/pages/api-keys/ApiKeyList.tsx` | 前端管理页面 | ✅ |
| `admin/src/components/Layout.tsx` | 导航菜单添加 API授权管理 | ✅ |
| `admin/src/utils/api.ts` | 添加 apiKeyApi 工具函数 | ✅ |
| `admin/src/i18n/locales/zh.json` | 添加中文翻译 | ✅ |
| `admin/src/i18n/locales/en.json` | 添加英文翻译 | ✅ |
| `admin/src/App.tsx` | 添加路由配置 | ✅ |

---

## 状态

✅ **已修复** - 2026-03-27 17:55

API Key 授权管理功能已完全可用，支持：
- 创建系统级 API Key（memberId 为 null）
- 列表查看所有 API Key
- 启用/禁用切换
- 删除 API Key
- 前端显示时密钥脱敏（`a61d****c9000` 格式）
- 创建时弹窗显示完整密钥（仅一次）
