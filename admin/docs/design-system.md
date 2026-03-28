# Admin 设计系统文档

> 建立日期：2026-03-28
> 版本：v1.0

## 📋 概述

本设计系统为 Indigenex 后台管理系统（Admin）提供统一的视觉规范和组件库，确保跨页面的一致性和开发效率。

## 🎯 设计原则

1. **一致性** - 所有页面使用统一的颜色、间距、圆角规范
2. **可复用性** - 组件封装业务逻辑，避免重复代码
3. **可维护性** - 样式集中管理，一处修改全局生效
4. **类型安全** - 完整的 TypeScript 类型定义

## 📁 目录结构

```
admin/src/
├── styles/
│   └── tokens.ts              # 设计令牌（颜色、间距、字体等）
├── components/
│   ├── ui/                    # 基础 UI 组件
│   │   ├── Button.tsx         # 按钮组件
│   │   ├── IconButton.tsx     # 图标按钮
│   │   ├── Input.tsx          # 输入框
│   │   ├── Card.tsx           # 卡片容器
│   │   └── index.ts           # 统一导出
│   └── business/              # 业务组件
│       ├── SearchBar.tsx      # 搜索筛选栏
│       ├── DataTable.tsx      # 数据表格
│       └── index.ts           # 统一导出
└── pages/
    └── customers/
        └── CustomerList.tsx   # 重构示例页面
```

## 🎨 设计令牌（Design Tokens）

### 颜色系统

```typescript
import { colors } from './styles/tokens'

// 主色调
colors.primary[500]    // #007AFF - 主按钮、链接

// 状态色
colors.success         // #34C759 - 成功、激活状态
colors.warning         // #FF9500 - 警告
colors.danger          // #FF3B30 - 错误、删除

// 中性色
colors.gray[50]        // #F5F5F7 - 背景色
colors.gray[100]       // #E5E5EA - 边框
colors.gray[400]       // #8E8E93 - 禁用文字
colors.gray[700]       // #3A3A3C - 次要文字
colors.gray[900]       // #1D1D1F - 主要文字
```

### 间距系统（4px 网格）

```typescript
import { spacing } from './styles/tokens'

spacing[0.5]  // 2px
spacing[1]    // 4px
spacing[2]    // 8px
spacing[3]    // 12px
spacing[4]    // 16px（默认卡片内边距）
spacing[5]    // 20px
spacing[6]    // 24px
```

### 圆角系统

```typescript
import { borderRadius } from './styles/tokens'

borderRadius.sm     // 2px
borderRadius.DEFAULT // 4px（通用圆角）
borderRadius.md     // 6px
borderRadius.lg     // 8px
```

### 字体系统

```typescript
import { typography } from './styles/tokens'

// 字号
typography.size.xs    // 11px（表头）
typography.size.sm    // 12px（正文）
typography.size.DEFAULT // 13px
typography.size.lg    // 14px
typography.size.xl    // 16px（标题）

// 字重
typography.weight.normal   // 400
typography.weight.medium   // 500（按钮文字）
typography.weight.semibold // 600（表头）
```

## 🧩 组件使用规范

### Button 按钮

```tsx
import { Button } from '../components/ui'

// 变体
<Button variant="primary">主按钮</Button>
<Button variant="secondary">次按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">危险按钮</Button>

// 尺寸
<Button size="sm">小按钮</Button>
<Button size="md">中按钮（默认）</Button>
<Button size="lg">大按钮</Button>

// 状态
<Button loading>加载中</Button>
<Button disabled>禁用</Button>
<Button block>块级显示</Button>
```

### IconButton 图标按钮

```tsx
import { IconButton } from '../components/ui'
import { Settings } from 'lucide-react'

<IconButton
  icon={<Settings size={16} />}
  variant="default"
  size="md"
  active={isActive}
  title="设置"
/>
```

### Input 输入框

```tsx
import { Input } from '../components/ui'
import { Search } from 'lucide-react'

<Input
  prefix={<Search size={14} />}
  placeholder="请输入..."
  size="md"
/>
```

### SearchBar 搜索筛选栏

```tsx
import { SearchBar } from '../components/business'

<SearchBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="搜索..."
  filters={[{
    key: 'status',
    label: '全部状态',
    options: [{ value: 'active', label: '正常' }],
    value: filterStatus,
    onChange: setFilterStatus
  }]}
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters(!showFilters)}
  actions={<Button>新增</Button>}
  columnSettings={<IconButton icon={<Settings />} />}
/>
```

### DataTable 数据表格

```tsx
import { DataTable } from '../components/business'
import type { Column } from '../components/business'

const columns: Column<DataItem>[] = [
  { key: 'name', title: '名称', width: '200px' },
  { key: 'status', title: '状态', align: 'center' },
  { key: 'actions', title: '操作', width: '80px', fixed: 'right' }
]

<DataTable
  columns={columns}
  data={dataList}
  loading={loading}
  rowKey="id"
  currentPage={page}
  totalPages={totalPages}
  totalCount={totalCount}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

## 📐 页面布局规范

### 标准页面结构

```tsx
<div style={{
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  background: colors.bg.secondary  // 页面背景色
}}>
  {/* 页面头部 */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[3]} ${spacing[4]}`,
    background: colors.bg.primary
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
      <h1 style={{ fontSize: 16, fontWeight: 600 }}>页面标题</h1>
      <span style={{ fontSize: 12, color: colors.text.tertiary }}>副标题描述</span>
    </div>
  </div>

  {/* 搜索筛选区 */}
  <div style={{
    background: colors.bg.primary,
    borderRadius: borderRadius.DEFAULT,
    padding: `${spacing[2.5]} ${spacing[4]}`,
    margin: `${spacing[3]} ${spacing[4]}`,
    border: `1px solid ${colors.border.DEFAULT}`
  }}>
    <SearchBar ... />
  </div>

  {/* 数据表格区 */}
  <div style={{
    flex: 1,
    overflow: 'auto',
    margin: `0 ${spacing[4]} ${spacing[3]}`,
    background: colors.bg.primary,
    borderRadius: borderRadius.DEFAULT,
    border: `1px solid ${colors.border.DEFAULT}`
  }}>
    <DataTable ... />
  </div>
</div>
```

## 🔄 重构迁移指南

### 旧代码（内联样式）
```tsx
<button
  onClick={() => navigate('/customers/new')}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 14px',
    borderRadius: 4,
    border: 'none',
    background: '#007AFF',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer'
  }}
>
  <Plus size={14} />
  新增客户
</button>
```

### 新代码（组件化）
```tsx
import { Button } from '../components/ui'

<Button variant="primary" size="md" onClick={() => navigate('/customers/new')}>
  <Plus size={14} />
  新增客户
</Button>
```

## 📋 代码规范检查清单

- [ ] 使用 Design Tokens 而非硬编码颜色/间距
- [ ] 优先使用封装组件而非内联样式
- [ ] 组件 props 使用 TypeScript 类型定义
- [ ] 业务逻辑抽取为可复用 hooks
- [ ] 遵循命名规范（PascalCase 组件、camelCase 函数）

## 🚀 后续优化计划

1. **添加更多基础组件**
   - Select 下拉选择
   - DatePicker 日期选择
   - Modal 弹窗
   - Form 表单

2. **配置 ESLint 规则**
   - 禁止内联样式
   - 强制使用设计令牌
   - 组件命名规范

3. **添加 Storybook**
   - 组件文档展示
   - 交互式调试

4. **响应式适配**
   - 移动端布局
   - 断点系统设计
