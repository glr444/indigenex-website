import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Settings,
  Edit2,
  Trash2,
  Users,
  Phone,
  Star,
  UserPlus,
  X,
  GripVertical,
} from 'lucide-react'
import { customerApi } from '../../utils/api'
import { Button, IconButton } from '../../components/ui'
import { SearchBar, DataTable } from '../../components/business'
import type { Column } from '../../components/business'
import { colors, spacing, borderRadius, shadows, transitions } from '../../styles/tokens'

// ==================== 类型定义 ====================
interface Customer {
  id: string
  name: string
  creditCode: string | null
  industry: string | null
  level: string | null
  type: string | null
  status: string
  ownerId: string | null
  source: string
  tags: string[]
  primaryContact: {
    name: string
    phone: string | null
    position: string | null
  } | null
  followUpCount: number
  contactCount: number
  lastFollowUpAt: string | null
  createdAt: string
  updatedAt: string
}

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  width?: string
}

// ==================== 常量配置 ====================
const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: '公司名称', visible: true, width: '250px' },
  { key: 'industry', label: '行业类型', visible: true, width: '120px' },
  { key: 'contact', label: '联系人', visible: true, width: '120px' },
  { key: 'phone', label: '电话', visible: true, width: '130px' },
  { key: 'level', label: '等级', visible: true, width: '80px' },
  { key: 'type', label: '类型', visible: true, width: '80px' },
  { key: 'lastFollowUp', label: '最后跟进', visible: true, width: '120px' },
  { key: 'status', label: '状态', visible: true, width: '90px' },
  { key: 'actions', label: '操作', visible: true, width: '50px' },
]

const statusOptions = [
  { value: 'active', label: '正常' },
  { value: 'public', label: '公海' },
  { value: 'archived', label: '归档' },
]

const levelOptions = [
  { value: 'A', label: 'A级' },
  { value: 'B', label: 'B级' },
  { value: 'C', label: 'C级' },
  { value: 'D', label: 'D级' },
]

const typeOptions = [
  { value: 'direct', label: '直客' },
  { value: 'peer', label: '同行' },
  { value: 'agent', label: '代理' },
]

// ==================== 辅助函数 ====================
const getLevelColor = (level: string | null) => {
  switch (level) {
    case 'A': return colors.danger
    case 'B': return '#FF9500'
    case 'C': return colors.primary[500]
    case 'D': return colors.success
    default: return colors.gray[400]
  }
}

const getLevelText = (level: string | null) => {
  switch (level) {
    case 'A': return 'A级'
    case 'B': return 'B级'
    case 'C': return 'C级'
    case 'D': return 'D级'
    default: return '-'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return colors.success
    case 'public': return colors.primary[500]
    case 'archived': return colors.gray[400]
    default: return colors.gray[400]
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '正常'
    case 'public': return '公海'
    case 'archived': return '归档'
    default: return status
  }
}

const getTypeText = (type: string | null) => {
  switch (type) {
    case 'direct': return '直客'
    case 'peer': return '同行'
    case 'agent': return '代理'
    default: return '-'
  }
}

// ==================== 子组件 ====================

/**
 * 列设置下拉面板
 */
function ColumnSettingsPanel({
  columns,
  onToggle,
  onReset,
  onClose,
  onReorder,
}: {
  columns: ColumnConfig[]
  onToggle: (key: string) => void
  onReset: () => void
  onClose: () => void
  onReorder: (dragIndex: number, dropIndex: number) => void
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const draggableColumns = columns.filter((c) => c.key !== 'actions')

  const handleDragStart = (index: number) => setDraggingIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggingIndex === null || draggingIndex === index) return
  }
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggingIndex !== null && draggingIndex !== dropIndex) {
      onReorder(draggingIndex, dropIndex)
    }
    setDraggingIndex(null)
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: spacing[2],
        background: colors.bg.primary,
        borderRadius: borderRadius.DEFAULT,
        boxShadow: shadows.lg,
        padding: spacing[3],
        minWidth: 200,
        zIndex: 1000,
        border: `1px solid ${colors.border.DEFAULT}`,
      }}
    >
      {/* 面板头部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[2.5],
          paddingBottom: spacing[2.5],
          borderBottom: `1px solid ${colors.border.dark}`,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary }}>
          自定义列
        </span>
        <IconButton icon={<X size={16} />} variant="ghost" size="sm" onClick={onClose} />
      </div>

      {/* 列列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
        {draggableColumns.map((col, index) => (
          <div
            key={col.key}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[1.5]} ${spacing[2]}`,
              borderRadius: borderRadius.DEFAULT,
              cursor: 'move',
              background: draggingIndex === index ? colors.bg.secondary : 'transparent',
              transition: `background ${transitions.DEFAULT}`,
            }}
          >
            <GripVertical size={14} style={{ color: colors.gray[300], flexShrink: 0 }} />
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() => onToggle(col.key)}
              style={{ cursor: 'pointer' }}
              onClick={(e) => e.stopPropagation()}
            />
            <span style={{ fontSize: 12, color: colors.text.secondary, flex: 1 }}>
              {col.label}
            </span>
          </div>
        ))}
      </div>

      {/* 重置按钮 */}
      <div
        style={{
          marginTop: spacing[2.5],
          paddingTop: spacing[2.5],
          borderTop: `1px solid ${colors.border.dark}`,
        }}
      >
        <Button variant="secondary" size="sm" block onClick={onReset}>
          重置为默认
        </Button>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function CustomerList() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 状态管理
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterType, setFilterType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('customerListColumns')
    return saved ? JSON.parse(saved) : defaultColumns
  })

  // 保存列设置
  useEffect(() => {
    localStorage.setItem('customerListColumns', JSON.stringify(columns))
  }, [columns])

  // 获取数据
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)
      if (filterLevel) params.append('level', filterLevel)
      if (filterType) params.append('type', filterType)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())

      const response = await customerApi.getAll(params.toString())
      if (response.success) {
        const data = response.data as { customers: Customer[]; pagination: { total: number; totalPages: number } }
        setCustomers(data.customers || [])
        const total = data.pagination?.total || 0
        setTotalCount(total)
        setTotalPages(data.pagination?.totalPages || Math.ceil(total / pageSize) || 1)
      }
    } catch {
      // 错误处理
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterStatus, filterLevel, filterType, currentPage, pageSize])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // 操作处理
  const handleDelete = async (id: string) => {
    if (!confirm(t('customers.confirmDelete'))) return
    try {
      await customerApi.delete(id)
      fetchCustomers()
    } catch {
      alert(t('customers.deleteFailed'))
    }
  }

  const handleClaim = async (id: string) => {
    if (!confirm(t('customers.confirmClaim'))) return
    try {
      await customerApi.claim(id)
      fetchCustomers()
    } catch {
      alert(t('customers.claimFailed'))
    }
  }

  // 列设置处理
  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    )
  }

  const resetColumns = () => setColumns(defaultColumns)

  const reorderColumns = (dragIndex: number, dropIndex: number) => {
    const draggable = columns.filter((c) => c.key !== 'actions')
    const actionsCol = columns.find((c) => c.key === 'actions')
    const newOrder = [...draggable]
    const [dragged] = newOrder.splice(dragIndex, 1)
    newOrder.splice(dropIndex, 0, dragged)
    if (actionsCol) newOrder.push(actionsCol)
    setColumns(newOrder)
  }

  // 渲染单元格
  const renderCell = (customer: Customer, key: string) => {
    switch (key) {
      case 'name':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1.5] }}>
            <span style={{ fontWeight: 500, color: colors.text.primary, fontSize: 12 }}>
              {customer.name}
            </span>
            {customer.tags?.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  padding: '1px 6px',
                  borderRadius: borderRadius.sm,
                  fontSize: 11,
                  background: colors.bg.secondary,
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.DEFAULT}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )

      case 'industry':
        return <span style={{ color: colors.text.secondary }}>{customer.industry || '-'}</span>

      case 'contact':
        return customer.primaryContact ? (
          <div>
            <div style={{ fontWeight: 500, color: colors.text.primary }}>
              {customer.primaryContact.name}
            </div>
            {customer.primaryContact.position && (
              <div style={{ fontSize: 11, color: colors.text.tertiary }}>
                {customer.primaryContact.position}
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: colors.text.quaternary }}>-</span>
        )

      case 'phone':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.text.secondary }}>
            <Phone size={12} />
            {customer.primaryContact?.phone || '-'}
          </div>
        )

      case 'level':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 8px',
              borderRadius: borderRadius.DEFAULT,
              fontSize: 11,
              fontWeight: 600,
              background: `${getLevelColor(customer.level)}15`,
              color: getLevelColor(customer.level),
            }}
          >
            <Star size={10} />
            {getLevelText(customer.level)}
          </span>
        )

      case 'type':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 8px',
              borderRadius: borderRadius.DEFAULT,
              fontSize: 11,
              fontWeight: 500,
              background: colors.bg.secondary,
              color: colors.text.secondary,
              border: `1px solid ${colors.border.DEFAULT}`,
            }}
          >
            <Users size={10} />
            {getTypeText(customer.type)}
          </span>
        )

      case 'lastFollowUp':
        return (
          <span style={{ color: colors.text.secondary }}>
            {customer.lastFollowUpAt
              ? new Date(customer.lastFollowUpAt).toLocaleDateString('zh-CN')
              : '-'}
          </span>
        )

      case 'status':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 8px',
              borderRadius: borderRadius.DEFAULT,
              fontSize: 11,
              fontWeight: 500,
              background: `${getStatusColor(customer.status)}15`,
              color: getStatusColor(customer.status),
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: getStatusColor(customer.status),
              }}
            />
            {getStatusText(customer.status)}
          </span>
        )

      case 'actions':
        return (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {customer.status === 'public' ? (
              <IconButton
                icon={<UserPlus size={14} />}
                variant="ghost"
                size="sm"
                onClick={() => handleClaim(customer.id)}
                title={t('customers.claim', '认领')}
              />
            ) : (
              <>
                <IconButton
                  icon={<Edit2 size={14} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  title={t('common.view', '查看')}
                />
                <IconButton
                  icon={<Trash2 size={14} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(customer.id)}
                  title={t('common.delete', '删除')}
                />
              </>
            )}
          </div>
        )

      default:
        return '-'
    }
  }

  // 构建表格列配置
  const tableColumns: Column<Customer>[] = useMemo(() => {
    return columns
      .filter((c) => c.visible)
      .map((col) => ({
        key: col.key,
        title: col.label,
        width: col.width,
        align: ['level', 'type', 'status', 'actions'].includes(col.key)
          ? 'center'
          : 'left',
        fixed: col.key === 'actions' ? 'right' : undefined,
        render: (record: Customer) => renderCell(record, col.key),
      }))
  }, [columns])

  // 筛选器配置
  const filterItems = [
    {
      key: 'status',
      label: '全部状态',
      options: statusOptions,
      value: filterStatus,
      onChange: setFilterStatus,
    },
    {
      key: 'level',
      label: '全部等级',
      options: levelOptions,
      value: filterLevel,
      onChange: setFilterLevel,
    },
    {
      key: 'type',
      label: '全部类型',
      options: typeOptions,
      value: filterType,
      onChange: setFilterType,
    },
  ]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: colors.bg.secondary,
      }}
    >
      {/* 页面头部 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing[3]} ${spacing[4]}`,
          background: colors.bg.primary,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: colors.text.primary, margin: 0 }}>
            {t('customers.title', '客户管理')}
          </h1>
          <span style={{ fontSize: 12, color: colors.text.tertiary }}>
            {t('customers.subtitle', '管理客户信息、跟进记录和成交数据')}
          </span>
        </div>
      </div>

      {/* 搜索筛选栏 */}
      <div
        style={{
          background: colors.bg.primary,
          borderRadius: borderRadius.DEFAULT,
          padding: `${spacing[2.5]} ${spacing[4]}`,
          margin: `${spacing[3]} ${spacing[4]}`,
          border: `1px solid ${colors.border.DEFAULT}`,
          flexShrink: 0,
        }}
      >
        <SearchBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t('customers.searchPlaceholder', '搜索公司名称、联系人、电话...')}
          filters={filterItems}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          actions={
            <Button variant="primary" size="md" onClick={() => navigate('/customers/new')}>
              <Plus size={14} />
              {t('customers.newCustomer', '新增客户')}
            </Button>
          }
          columnSettings={
            <div style={{ position: 'relative' }}>
              <IconButton
                icon={<Settings size={16} />}
                variant={showColumnSettings ? 'default' : 'default'}
                size="md"
                active={showColumnSettings}
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                title="列设置"
              />
              {showColumnSettings && (
                <ColumnSettingsPanel
                  columns={columns}
                  onToggle={toggleColumn}
                  onReset={resetColumns}
                  onClose={() => setShowColumnSettings(false)}
                  onReorder={reorderColumns}
                />
              )}
            </div>
          }
        />
      </div>

      {/* 数据表格 */}
      <div
        style={{
          background: colors.bg.primary,
          borderRadius: borderRadius.DEFAULT,
          border: `1px solid ${colors.border.DEFAULT}`,
          overflow: 'auto',
          flex: 1,
          minHeight: 0,
          margin: `0 ${spacing[4]} ${spacing[3]}`,
        }}
      >
        <DataTable
          columns={tableColumns}
          data={customers}
          loading={loading}
          emptyText={t('customers.noData', '暂无客户数据')}
          rowKey="id"
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      </div>
    </div>
  )
}
