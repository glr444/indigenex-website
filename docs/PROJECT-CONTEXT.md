# Indigenex 项目上下文速查

> 用于快速了解项目状态和当前进度

---

## 项目基本信息

| 项目 | 详情 |
|------|------|
| 名称 | Indigenex Logistics Website |
| 路径 | `/Users/ligang/New/indigenex-website` |
| 服务器 | 47.236.193.197（阿里云轻量应用服务器） |
| 技术栈 | Next.js + React + Express + Prisma + MySQL + PM2 + Nginx |

## 访问地址

| 服务 | URL |
|------|-----|
| 前台网站 | http://47.236.193.197/ |
| 管理后台 | http://47.236.193.197/admin/ |
| 会员门户 | http://47.236.193.197/portal/login |
| API 接口 | http://47.236.193.197/api |

## 当前菜单结构（已上线）

```
├── 首页
├── 门户管理 → 新闻管理
├── 客商管理 ▼
│   ├── 客户管理 (占位)
│   ├── 供应商管理 (占位)
│   └── 会员管理 ✅
├── 运价管理 ▼
│   ├── 运价维护 ✅
│   └── 询盘管理 ✅
├── 订单管理 ▼
│   └── 订单列表 (占位)
├── 基础资料 ▼
│   ├── 港口管理 ✅
│   ├── 航线管理 ✅
│   └── 船公司管理 ✅
└── 系统设置 ▼
    ├── API授权管理 ✅
    └── 员工管理 (占位)
```

✅ = 功能完成 | (占位) = 仅菜单，页面显示"功能开发中"

---

## 数据库表（当前）

| 表名 | 记录数 | 状态 |
|------|--------|------|
| User | 1 | 管理员账号 |
| Member | 0+ | 会员账号 |
| News | - | 新闻数据 |
| Contact | - | 询盘数据 |
| FreightRate | 5+ | 运价数据 |
| Port | 82 | 港口数据 |
| Carrier | 15 | 船公司数据 |
| Route | 10 | 航线数据 |
| ApiKey | - | API授权 |

**待创建表**:
- Customer（客户）
- Supplier（供应商）
- Staff（员工）

---

## 最近完成的工作（2026-03-27）

1. ✅ API Key 系统与会员系统完全解耦
2. ✅ 导航栏支持折叠 + Tooltip
3. ✅ 表格行高优化（更紧凑）
4. ✅ 菜单结构重新设计（7个一级菜单，支持二级展开）

---

## 待开发功能（按优先级）

### P0 - 客商管理
- [ ] 客户管理（列表、新增、编辑、删除）
- [ ] 供应商管理（列表、新增、编辑、删除）

### P1 - 系统设置
- [ ] 员工管理（列表、新增、编辑、删除）

### P2 - 订单管理
- [ ] 等待 M4 系统对接

---

## 技术要点

### 后端
- **框架**: Express.js (Node.js)
- **ORM**: Prisma
- **数据库**: MySQL 8.0 (Docker)
- **认证**: JWT
- **端口**: 5001

### 前端 Admin
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **路由**: React Router DOM
- **图标**: Lucide React
- **样式**: Inline Style（项目风格）

### 部署
- **进程管理**: PM2
- **反向代理**: Nginx
- **前端路径**: `/var/www/indigenex-website/admin/dist/`
- **后端路径**: `/var/www/indigenex-website/backend/`

---

## 开发规范

### 新增列表页流程
1. 创建 `pages/<module>/<Module>List.tsx`
2. 在 `App.tsx` 添加路由
3. 如需要，在 `Layout.tsx` 的 `navItems` 中添加菜单

### 新增 API 流程
1. 检查/更新 `prisma/schema.prisma`
2. 创建/修改路由文件 `src/routes/admin/*.routes.js`
3. 运行 `npx prisma migrate dev`
4. 重启后端服务

### 图标使用
- 在 [lucide.dev](https://lucide.dev) 搜索图标
- 常用：LayoutDashboard, Newspaper, Ship, Building2, Settings, ClipboardList, Users

---

## 常见问题

### 构建失败
```bash
cd admin && npm run build
# 检查 TypeScript 错误（未使用的变量/导入）
```

### 部署后未生效
```bash
# 确认路径正确
/var/www/indigenex-website/admin/dist/

# 刷新 nginx
ssh -i ~/.ssh/deploy-key.pem root@47.236.193.197 "systemctl reload nginx"
```

### 后端日志查看
```bash
ssh -i ~/.ssh/deploy-key.pem root@47.236.193.197 "pm2 logs indigenex-backend --lines 30 --nostream"
```

---

## 相关文档

| 文档 | 路径 |
|------|------|
| 详细设计 | `docs/design/admin-detailed-design.md` |
| 工作日志 | `docs/work-log/2026-03-27-work-summary.md` |
| 问题复盘 | `docs/work-log/2026-03-27-issue-review.md` |
| API 文档 | `docs/api-documentation-v1.md` |
| 项目记忆 | `~/.claude/projects/-Users-ligang-New/memory/MEMORY.md` |

---

*最后更新: 2026-03-27 22:00*
