# Admin 组件使用速查表

## 快速开始

```tsx
// 基础 UI 组件
import { Button, IconButton, Input, Card } from '../components/ui'

// 业务组件
import { SearchBar, DataTable } from '../components/business'

// 设计令牌
import { colors, spacing, borderRadius, typography } from '../styles/tokens'
```

---

## Button 按钮

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | 按钮变体 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| loading | boolean | false | 加载状态 |
| disabled | boolean | false | 禁用状态 |
| block | boolean | false | 块级显示 |

**示例：**
```tsx
<Button variant="primary" size="md">主按钮</Button>
<Button variant="secondary" size="sm">次按钮</Button>
<Button variant="danger" loading>删除中...</Button>
```

---

## IconButton 图标按钮

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | ReactNode | 必填 | 图标元素 |
| variant | `'default' \| 'primary' \| 'ghost'` | `'default'` | 变体 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| active | boolean | false | 激活状态 |
| title | string | - | 鼠标提示 |

**示例：**
```tsx
<IconButton icon={<Settings size={16} />} title="设置" />
<IconButton icon={<Edit2 size={14} />} variant="ghost" size="sm" />
```

---

## Input 输入框

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| prefix | ReactNode | - | 前缀图标/文字 |
| suffix | ReactNode | - | 后缀内容 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| error | boolean | false | 错误状态 |

**示例：**
```tsx
<Input
  prefix={<Search size={14} color={colors.text.tertiary} />}
  placeholder="搜索..."
/>
```

---

## SearchBar 搜索筛选栏

| 属性 | 类型 | 说明 |
|------|------|------|
| searchValue | string | 搜索关键词 |
| onSearchChange | (value: string) => void | 搜索变化回调 |
| searchPlaceholder | string | 搜索占位符 |
| filters | FilterItem[] | 筛选器配置 |
| showFilters | boolean | 是否显示筛选区 |
| onToggleFilters | () => void | 切换筛选显示 |
| actions | ReactNode | 右侧操作按钮 |
| columnSettings | ReactNode | 列设置按钮 |

**FilterItem 结构：**
```tsx
interface FilterItem {
  key: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}
```

**示例：**
```tsx
<SearchBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  filters={[
    {
      key: 'status',
      label: '全部状态',
      options: [{ value: 'active', label: '正常' }],
      value: filterStatus,
      onChange: setFilterStatus
    }
  ]}
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters(!showFilters)}
  actions={<Button variant="primary">新增</Button>}
/>
```

---

## DataTable 数据表格

| 属性 | 类型 | 说明 |
|------|------|------|
| columns | Column<T>[] | 列配置 |
| data | T[] | 表格数据 |
| loading | boolean | 加载状态 |
| emptyText | string | 空数据提示 |
| rowKey | keyof T | 行唯一标识字段 |
| currentPage | number | 当前页码 |
| totalPages | number | 总页数 |
| totalCount | number | 总记录数 |
| pageSize | number | 每页条数 |
| onPageChange | (page: number) => void | 页码变化回调 |
| onPageSizeChange | (size: number) => void | 每页条数变化回调 |

**Column 结构：**
```tsx
interface Column<T> {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  fixed?: 'right'
  render?: (record: T) => ReactNode
}
```

**示例：**
```tsx
const columns: Column<Customer>[] = [
  { key: 'name', title: '公司名称', width: '250px' },
  { key: 'status', title: '状态', align: 'center' },
  {
    key: 'actions',
    title: '操作',
    width: '50px',
    fixed: 'right',
    align: 'center'
  }
]

<DataTable
  columns={columns}
  data={customers}
  loading={loading}
  rowKey="id"
  currentPage={currentPage}
  totalPages={totalPages}
  totalCount={totalCount}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
/>
```

---

## 设计令牌速查

### 颜色
```tsx
colors.primary[500]    // #007AFF
colors.success         // #34C759
colors.danger          // #FF3B30
colors.gray[50]        // #F5F5F7 背景
colors.gray[100]       // #E5E5EA 边框
colors.gray[400]       // #8E8E93 禁用
colors.gray[900]       // #1D1D1F 主文字
colors.text.primary    // #1D1D1F
colors.text.secondary  // #3A3A3C
colors.text.tertiary   // #86868B
```

### 间距
```tsx
spacing[1]   // 4px
spacing[2]   // 8px
spacing[3]   // 12px
spacing[4]   // 16px
spacing[5]   // 20px
spacing[6]   // 24px
```

### 圆角
```tsx
borderRadius.DEFAULT  // 4px（通用）
borderRadius.sm       // 2px
borderRadius.lg       // 8px
```

### 字号
```tsx
typography.size.xs    // 11px（表头）
typography.size.sm    // 12px（正文）
typography.size.lg    // 14px
typography.size.xl    // 16px（标题）
```

---

## 布局模板

### 标准列表页
```tsx
<div style={{
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  background: colors.bg.secondary
}}>
  {/* Header */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing[3]} ${spacing[4]}`,
    background: colors.bg.primary
  }}>
    <h1 style={{ fontSize: 16, fontWeight: 600 }}>标题</h1>
  </div>

  {/* SearchBar */}
  <div style={{
    background: colors.bg.primary,
    borderRadius: borderRadius.DEFAULT,
    padding: spacing[3],
    margin: `${spacing[3]} ${spacing[4]}`,
    border: `1px solid ${colors.border.DEFAULT}`
  }}>
    <SearchBar ... />
  </div>

  {/* DataTable */}
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
