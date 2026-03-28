# Indigenex Admin 详细设计文档

> 版本: v1.0
> 日期: 2026-03-27
> 状态: 进行中

---

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端浏览器                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (反向代理)                        │
│  ┌─────────────┬─────────────┬────────────────────────────┐ │
│  │ /           │ /admin/     │ /api/*, /portal/*          │ │
│  │ 前台网站    │ 管理后台    │ 后端 API (5001)            │ │
│  │ Next.js     │ React SPA   │ Express + Prisma           │ │
│  │ Port 3000   │ Static      │                            │ │
│  └─────────────┴─────────────┴──────────┬─────────────────┘ │
└─────────────────────────────────────────┼───────────────────┘
                                          │
                          ┌───────────────┘
                          │
               ┌──────────▼──────────┐
               │   MySQL 8.0 Docker  │
               │   Port: 3306        │
               │   Memory: 512M      │
               └─────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术 | 版本 |
|-----|------|------|
| 前端框架 | React | ^18.3.0 |
| 路由 | React Router DOM | ^6.26.0 |
| 构建工具 | Vite | ^5.4.0 |
| UI 图标 | Lucide React | ^0.439.0 |
| 国际化 | React i18next | ^15.0.0 |
| 后端框架 | Express | ^4.19.0 |
| ORM | Prisma | ^6.5.0 |
| 数据库 | MySQL | 8.0 |
| 进程管理 | PM2 | latest |
| 反向代理 | Nginx | latest |

---

## 2. 模块设计

### 2.1 模块划分

```
admin/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Layout.tsx      # 布局组件（侧边栏+顶部栏）
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── contexts/           # React Context
│   │   └── AuthContext.tsx
│   ├── pages/              # 页面组件
│   │   ├── dashboard/      # 首页
│   │   ├── news/           # 门户管理
│   │   ├── members/        # 会员管理（客商管理子模块）
│   │   ├── freight-rates/  # 运价维护
│   │   ├── contacts/       # 询盘管理
│   │   ├── orders/         # 订单列表（占位）
│   │   ├── ports/          # 港口管理
│   │   ├── routes/         # 航线管理
│   │   ├── carriers/       # 船公司管理
│   │   ├── api-keys/       # API授权管理
│   │   └── [预留]          # 客户管理、供应商管理、员工管理
│   ├── utils/              # 工具函数
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── logo.png
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 2.2 待开发模块清单

| 优先级 | 模块 | 状态 | 说明 |
|-------|------|------|------|
| P0 | 客户管理 | 待开发 | 客商管理子模块 |
| P0 | 供应商管理 | 待开发 | 客商管理子模块 |
| P1 | 员工管理 | 待开发 | 系统设置子模块 |
| P2 | 订单列表 | 占位 | 需等M4系统开发 |

---

## 3. 数据库设计

### 3.1 核心实体关系

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User (管理员)  │     │   Member (会员)  │     │  Customer (客户) │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ username        │     │ email           │     │ companyName     │
│ password        │     │ password        │     │ contactName     │
│ role            │     │ companyName     │     │ email           │
│ isFirstLogin    │     │ isApproved      │     │ phone           │
│ createdAt       │     │ createdAt       │     │ address         │
└────────┬────────┘     └────────┬────────┘     │ type            │
         │                       │              │ status          │
         │                       │              │ createdAt       │
         │                       │              └─────────────────┘
         │                       │
         │              ┌────────▼────────┐
         │              │  Supplier (供应商)│
         │              ├─────────────────┤
         │              │ id (PK)         │
         │              │ companyName     │
         │              │ contactName     │
         │              │ email           │
         │              │ phone           │
         │              │ serviceType     │
         │              │ status          │
         │              │ createdAt       │
         │              └─────────────────┘
         │
┌────────▼────────┐
│  Staff (员工)   │
├─────────────────┤
│ id (PK)         │
│ employeeNo      │
│ fullName        │
│ department      │
│ position        │
│ email           │
│ phone           │
│ status          │
│ createdAt       │
└─────────────────┘
```

### 3.2 已有表结构（参考）

**News (新闻)**
- id, title, slug, content, summary, isPublished, publishedAt, createdAt, updatedAt

**Contact (询盘)**
- id, fullName, email, phone, company, inquiryType, message, isRead, createdAt

**FreightRate (运价)**
- id, portFromId, portToId, carrierId, routeId, transitTime, validFrom, validTo, isActive, createdAt

**Port (港口)**
- id, code, name, nameCn, country, region, isActive

**Carrier (船公司)**
- id, code, name, nameEn, logo, website, contactInfo, isActive

**Route (航线)**
- id, code, nameEn, nameCn, description, regionFrom, regionTo, isActive

**ApiKey (API授权)**
- id, key, name, description, permissions, isActive, lastUsedAt, expiresAt, createdByAdminId, createdAt

---

## 4. API 设计

### 4.1 已有 API 清单

| 接口 | 方法 | 路径 | 说明 |
|-----|------|------|------|
| 登录 | POST | /api/auth/login | 管理员登录 |
| 获取当前用户 | GET | /api/auth/me | 获取登录用户信息 |
| 修改密码 | POST | /api/auth/change-password | 首次登录修改密码 |
| 新闻列表 | GET | /api/news | 获取新闻列表 |
| 新闻详情 | GET | /api/news/:id | 获取单条新闻 |
| 创建新闻 | POST | /api/admin/news | 创建新闻 |
| 更新新闻 | PUT | /api/admin/news/:id | 更新新闻 |
| 删除新闻 | DELETE | /api/admin/news/:id | 删除新闻 |
| 询盘列表 | GET | /api/contact | 获取询盘列表 |
| 标记已读 | PATCH | /api/contact/:id/read | 标记询盘已读 |
| 运价列表 | GET | /api/admin/freight-rates | 获取运价列表 |
| 创建运价 | POST | /api/admin/freight-rates | 创建运价 |
| 更新运价 | PUT | /api/admin/freight-rates/:id | 更新运价 |
| 删除运价 | DELETE | /api/admin/freight-rates/:id | 删除运价 |
| 港口列表 | GET | /api/admin/ports | 获取港口列表 |
| 航线列表 | GET | /api/admin/routes | 获取航线列表 |
| 船公司列表 | GET | /api/admin/carriers | 获取船公司列表 |
| API Key列表 | GET | /api/admin/api-keys | 获取API Key列表 |
| 创建API Key | POST | /api/admin/api-keys | 创建API Key |
| 删除API Key | DELETE | /api/admin/api-keys/:id | 删除API Key |

### 4.2 待开发 API

#### 客户管理
- GET /api/admin/customers - 客户列表
- POST /api/admin/customers - 创建客户
- PUT /api/admin/customers/:id - 更新客户
- DELETE /api/admin/customers/:id - 删除客户

#### 供应商管理
- GET /api/admin/suppliers - 供应商列表
- POST /api/admin/suppliers - 创建供应商
- PUT /api/admin/suppliers/:id - 更新供应商
- DELETE /api/admin/suppliers/:id - 删除供应商

#### 员工管理
- GET /api/admin/staff - 员工列表
- POST /api/admin/staff - 创建员工
- PUT /api/admin/staff/:id - 更新员工
- DELETE /api/admin/staff/:id - 删除员工

---

## 5. 前端组件设计

### 5.1 布局组件 Layout.tsx

**Props**: 无

**State**:
- `collapsed: boolean` - 侧边栏折叠状态
- `expandedMenus: string[]` - 展开的二级菜单

**子组件**:
- Tooltip - 悬停提示
- 导航渲染逻辑 - 支持一级/二级菜单

### 5.2 列表页通用模式

所有列表页遵循统一模式：

```typescript
// State
const [items, setItems] = useState<Item[]>([])
const [loading, setLoading] = useState(true)
const [searchTerm, setSearchTerm] = useState('')
const [currentPage, setCurrentPage] = useState(1)

// API 调用
const fetchItems = useCallback(async () => {
  setLoading(true)
  const response = await api.getList(params)
  setItems(response.data)
  setLoading(false)
}, [searchTerm, currentPage])

// 表格样式
const thStyle = { padding: '8px 10px', fontSize: 11, ... }
const tdStyle = { padding: '8px 10px', fontSize: 12, ... }
```

### 5.3 表单页通用模式

```typescript
// State
const [formData, setFormData] = useState<FormData>(initialValues)
const [errors, setErrors] = useState<Record<string, string>>({})
const [saving, setSaving] = useState(false)

// 提交
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validate()) return
  setSaving(true)
  await api.save(formData)
  navigate('/list')
}
```

---

## 6. 待开发功能详细设计

### 6.1 客户管理

**字段设计**:
```typescript
interface Customer {
  id: string
  companyName: string      // 公司名称
  contactName: string      // 联系人姓名
  email: string           // 邮箱
  phone: string           // 电话
  address?: string        // 地址
  industry?: string       // 行业
  scale?: string          // 规模
  source?: string         // 客户来源
  status: 'active' | 'inactive' | 'potential'
  remark?: string         // 备注
  createdAt: string
  updatedAt: string
}
```

**列表页功能**:
- 搜索：公司名称、联系人、邮箱
- 筛选：状态、行业、来源
- 操作：查看、编辑、删除

**表单页功能**:
- 必填：公司名称、联系人、邮箱
- 选填：其他字段

### 6.2 供应商管理

**字段设计**:
```typescript
interface Supplier {
  id: string
  companyName: string      // 公司名称
  contactName: string      // 联系人
  email: string
  phone: string
  serviceType: string[]    // 服务类型 [海运, 空运, 陆运, 仓储]
  regions: string[]        // 服务区域
  creditLevel?: string     // 信用等级
  status: 'active' | 'inactive' | 'blacklist'
  remark?: string
  createdAt: string
  updatedAt: string
}
```

### 6.3 员工管理

**字段设计**:
```typescript
interface Staff {
  id: string
  employeeNo: string       // 工号
  fullName: string         // 姓名
  department: string       // 部门
  position: string         // 职位
  email: string
  phone: string
  hireDate?: string        // 入职日期
  status: 'active' | 'resigned' | 'on_leave'
  createdAt: string
  updatedAt: string
}
```

---

## 7. 路由配置

### 7.1 当前路由

```typescript
<Route path="/" element={<Layout />}>
  <Route index element={<Navigate to="/dashboard" replace />} />
  <Route path="dashboard" element={<Dashboard />} />

  {/* 门户管理 */}
  <Route path="news" element={<NewsList />} />
  <Route path="news/new" element={<NewsEdit />} />
  <Route path="news/edit/:id" element={<NewsEdit />} />

  {/* 客商管理 */}
  <Route path="customers" element={<CustomerList />} />      // 待开发
  <Route path="suppliers" element={<SupplierList />} />      // 待开发
  <Route path="members" element={<MemberList />} />

  {/* 运价管理 */}
  <Route path="freight-rates" element={<FreightRateList />} />
  <Route path="freight-rates/new" element={<FreightRateEdit />} />
  <Route path="freight-rates/edit/:id" element={<FreightRateEdit />} />
  <Route path="contacts" element={<ContactList />} />
  <Route path="contacts/:id" element={<ContactDetail />} />

  {/* 订单管理 */}
  <Route path="orders" element={<OrderList />} />            // 占位

  {/* 基础资料 */}
  <Route path="ports" element={<PortList />} />
  <Route path="routes" element={<RouteList />} />
  <Route path="routes/new" element={<RouteEdit />} />
  <Route path="routes/edit/:id" element={<RouteEdit />} />
  <Route path="carriers" element={<CarrierList />} />
  <Route path="carriers/new" element={<CarrierEdit />} />
  <Route path="carriers/edit/:id" element={<CarrierEdit />} />

  {/* 系统设置 */}
  <Route path="api-keys" element={<ApiKeyList />} />
  <Route path="staff" element={<StaffList />} />            // 待开发
</Route>
```

---

## 8. 开发规范

### 8.1 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 inline style（项目当前风格）
- 图标使用 lucide-react
- 国际化使用 react-i18next

### 8.2 命名规范

- 组件：PascalCase（如 CustomerList.tsx）
- 工具函数：camelCase（如 fetchCustomers）
- 常量：SCREAMING_SNAKE_CASE
- 接口：PascalCase + 后缀（如 CustomerFormData）

### 8.3 文件组织

```
pages/customers/
├── CustomerList.tsx      # 列表页
├── CustomerEdit.tsx      # 编辑页
└── components/           # 私有组件（如需）
    └── CustomerForm.tsx
```

---

## 9. 下一步行动计划

### Phase 1: 客商管理（P0）
1. 客户管理模块
   - 创建数据库表
   - 开发后端 API
   - 开发前端列表页
   - 开发前端表单页

2. 供应商管理模块
   - 同上流程

### Phase 2: 员工管理（P1）
1. 员工管理模块

### Phase 3: 订单管理（P2）
1. 等待 M4 系统对接

---

*文档维护：随开发进度更新*
