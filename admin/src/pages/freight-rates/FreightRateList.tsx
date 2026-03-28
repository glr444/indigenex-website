import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Settings,
  Edit2,
  Trash2,
  Star,
  Upload,
  X,
  GripVertical,
} from 'lucide-react'
import { freightRateApi } from '../../utils/api'
import { Button, IconButton } from '../../components/ui'
import { SearchBar, DataTable } from '../../components/business'
import { colors, spacing, borderRadius, shadows, transitions } from '../../styles/tokens'
import type { Column } from '../../components/business'

// ==================== 类型定义 ====================
interface FreightRate {
  id: string
  route: string | null
  originPort: string
  originPortEn: string | null
  destinationPort: string
  destinationPortEn: string | null
  viaPort: string | null
  viaPortEn: string | null
  portArea: string | null
  validFrom: string
  validTo: string
  validityType: string
  isRecommended: boolean
  price20GP: number | null
  price40GP: number | null
  price40HQ: number | null
  price45HQ: number | null
  currency: string
  cost20GP: number | null
  cost40GP: number | null
  cost40HQ: number | null
  cost45HQ: number | null
  isAllIn: boolean
  carrier: string | null
  carrierLogo: string | null
  transitTime: number | null
  schedule: string | null
  routeCode: string | null
  vesselName: string | null
  voyage: string | null
  sailingDate: string | null
  estimatedDeparture: string | null
  bookingAgent: string | null
  bookingLink: string | null
  spaceStatus: string
  docCutoffDay: string | null
  docCutoffTime: string | null
  billOfLadingType: string | null
  shippingTerms: string | null
  surcharges: string | null
  weightLimit: string | null
  priceTrend: string | null
  contactInfo: string | null
  remarks: string | null
  status: string
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
  { key: 'route', label: '航线', visible: true, width: '150px' },
  { key: 'originPort', label: '起运港', visible: true, width: '120px' },
  { key: 'destinationPort', label: '目的港', visible: true, width: '120px' },
  { key: 'viaPort', label: '中转港', visible: true, width: '100px' },
  { key: 'price20GP', label: '20GP', visible: true, width: '90px' },
  { key: 'price40GP', label: '40GP', visible: true, width: '90px' },
  { key: 'price40HQ', label: '40HQ', visible: true, width: '90px' },
  { key: 'carrier', label: '船公司', visible: true, width: '100px' },
  { key: 'transitTime', label: '航程', visible: true, width: '80px' },
  { key: 'validity', label: '有效期', visible: true, width: '160px' },
  { key: 'spaceStatus', label: '舱位状态', visible: true, width: '100px' },
  { key: 'status', label: '状态', visible: true, width: '90px' },
  { key: 'actions', label: '操作', visible: true, width: '80px' },
]

// 合并保存的列配置与默认配置
function mergeColumnConfigs(saved: ColumnConfig[] | null, defaults: ColumnConfig[]): ColumnConfig[] {
  if (!saved || !Array.isArray(saved)) return defaults

  // 创建默认列的映射
  const defaultMap = new Map(defaults.map((col) => [col.key, col]))

  // 结果数组：保留保存的顺序，添加新增的默认列
  const result: ColumnConfig[] = []
  const processedKeys = new Set<string>()

  // 首先按保存的顺序添加列
  for (const savedCol of saved) {
    const defaultCol = defaultMap.get(savedCol.key)
    if (defaultCol) {
      // 合并保存的配置和默认配置（保留保存的visible，使用默认的label和width）
      result.push({
        ...defaultCol,
        visible: savedCol.visible,
      })
      processedKeys.add(savedCol.key)
    }
  }

  // 添加新增的默认列（在actions之前）
  for (const defaultCol of defaults) {
    if (!processedKeys.has(defaultCol.key)) {
      // 新增的列，插入到actions之前
      if (defaultCol.key === 'actions') {
        result.push(defaultCol)
      } else {
        // 找到actions的位置，插入到它前面
        const actionsIndex = result.findIndex((c) => c.key === 'actions')
        if (actionsIndex >= 0) {
          result.splice(actionsIndex, 0, defaultCol)
        } else {
          result.push(defaultCol)
        }
      }
      processedKeys.add(defaultCol.key)
    }
  }

  return result
}

const statusOptions = [
  { value: 'ACTIVE', label: '有效' },
  { value: 'INACTIVE', label: '无效' },
  { value: 'EXPIRED', label: '过期' },
]

const spaceStatusOptions = [
  { value: 'AVAILABLE', label: '充足' },
  { value: 'LIMITED', label: '紧张' },
  { value: 'FULL', label: '已满' },
  { value: 'SUSPENDED', label: '暂停' },
]

// ==================== 辅助函数 ====================
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return colors.success
    case 'EXPIRED': return colors.danger
    case 'INACTIVE': return colors.warning
    default: return colors.gray[400]
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': return '有效'
    case 'EXPIRED': return '过期'
    case 'INACTIVE': return '无效'
    default: return status
  }
}

const getSpaceStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return colors.success
    case 'LIMITED': return colors.warning
    case 'FULL': return colors.danger
    case 'SUSPENDED': return colors.gray[400]
    default: return colors.gray[400]
  }
}

const getSpaceStatusText = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return '充足'
    case 'LIMITED': return '紧张'
    case 'FULL': return '已满'
    case 'SUSPENDED': return '暂停'
    default: return status
  }
}

const formatPrice = (price: number | null, currency: string = 'USD') => {
  if (price === null || price === undefined) return '-'
  return `${currency} ${price.toLocaleString()}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
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
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const draggableColumns = columns.filter((c) => c.key !== 'actions')

  const handleDragStart = (key: string) => setDraggingKey(key)

  const handleDragOver = (e: React.DragEvent, _key: string) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropKey: string) => {
    e.preventDefault()
    if (!draggingKey || draggingKey === dropKey) {
      setDraggingKey(null)
      return
    }

    const dragIndex = draggableColumns.findIndex((c) => c.key === draggingKey)
    const dropIndex = draggableColumns.findIndex((c) => c.key === dropKey)

    if (dragIndex !== -1 && dropIndex !== -1) {
      onReorder(dragIndex, dropIndex)
    }
    setDraggingKey(null)
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
        {draggableColumns.map((col) => (
          <div
            key={col.key}
            draggable
            onDragStart={() => handleDragStart(col.key)}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[1.5]} ${spacing[2]}`,
              borderRadius: borderRadius.DEFAULT,
              cursor: 'move',
              background: draggingKey === col.key ? colors.bg.secondary : 'transparent',
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
export default function FreightRateList() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 状态管理
  const [rates, setRates] = useState<FreightRate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSpaceStatus, setFilterSpaceStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem('freightRateListColumns')
      const parsed = saved ? JSON.parse(saved) : null
      return mergeColumnConfigs(parsed, defaultColumns)
    } catch {
      return defaultColumns
    }
  })

  // 保存列设置
  useEffect(() => {
    localStorage.setItem('freightRateListColumns', JSON.stringify(columns))
  }, [columns])

  // 获取数据
  const fetchRates = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)
      if (filterSpaceStatus) params.append('spaceStatus', filterSpaceStatus)
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())

      const response = await freightRateApi.getAll(params.toString())
      if (response.success) {
        const data = response.data as { rates: FreightRate[]; pagination: { total: number; totalPages: number } }
        setRates(data.rates || [])
        const total = data.pagination?.total || 0
        setTotalCount(total)
        setTotalPages(data.pagination?.totalPages || Math.ceil(total / pageSize) || 1)
      }
    } catch {
      // 错误处理
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterStatus, filterSpaceStatus, currentPage, pageSize])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  // 操作处理
  const handleDelete = async (id: string) => {
    if (!confirm(t('freightRates.confirmDelete'))) return
    try {
      await freightRateApi.delete(id)
      fetchRates()
    } catch {
      alert(t('freightRates.deleteFailed'))
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await freightRateApi.import(formData)
      if (response.success && response.data) {
        const data = response.data as { imported?: number; success?: number }
        alert(t('freightRates.importSuccess', { count: data.imported || data.success || 0 }))
        fetchRates()
      }
    } catch {
      alert(t('freightRates.importFailed'))
    }
    e.target.value = ''
  }

  // 列设置处理
  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    )
  }

  const resetColumns = () => {
    setColumns(defaultColumns)
    localStorage.removeItem('freightRateListColumns')
  }

  const reorderColumns = (dragIndex: number, dropIndex: number) => {
    // 获取所有非actions列（按当前顺序）
    const draggableColumns = columns.filter((c) => c.key !== 'actions')
    const actionsCol = columns.find((c) => c.key === 'actions')

    // 在draggableColumns范围内进行拖拽
    if (dragIndex < 0 || dragIndex >= draggableColumns.length) return
    if (dropIndex < 0 || dropIndex >= draggableColumns.length) return

    const newDraggable = [...draggableColumns]
    const [dragged] = newDraggable.splice(dragIndex, 1)
    newDraggable.splice(dropIndex, 0, dragged)

    // 重新组合：非actions列 + actions列
    const newOrder: ColumnConfig[] = actionsCol
      ? [...newDraggable, actionsCol]
      : newDraggable

    setColumns(newOrder)
  }

  // 渲染单元格
  const renderCell = (rate: FreightRate, key: string) => {
    switch (key) {
      case 'route':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            {rate.isRecommended && (
              <Star size={14} style={{ color: colors.warning, fill: colors.warning }} />
            )}
            <span style={{ fontWeight: 500, color: colors.text.primary }}>
              {rate.route || '-'}
            </span>
          </div>
        )

      case 'originPort':
        return (
          <div>
            <div style={{ fontWeight: 500, color: colors.text.primary }}>
              {rate.originPort}
            </div>
            {rate.portArea && (
              <div style={{ fontSize: 11, color: colors.text.tertiary }}>
                {rate.portArea}
              </div>
            )}
          </div>
        )

      case 'destinationPort':
        return (
          <span style={{ color: colors.text.primary }}>
            {rate.destinationPort}
          </span>
        )

      case 'viaPort':
        return (
          <span style={{ color: rate.viaPort ? colors.text.secondary : colors.text.quaternary }}>
            {rate.viaPort || '-'}
          </span>
        )

      case 'price20GP':
        return (
          <span style={{ color: rate.price20GP ? colors.text.primary : colors.text.quaternary }}>
            {formatPrice(rate.price20GP, rate.currency)}
          </span>
        )

      case 'price40GP':
        return (
          <span style={{ color: rate.price40GP ? colors.text.primary : colors.text.quaternary }}>
            {formatPrice(rate.price40GP, rate.currency)}
          </span>
        )

      case 'price40HQ':
        return (
          <span style={{ color: rate.price40HQ ? colors.text.primary : colors.text.quaternary }}>
            {formatPrice(rate.price40HQ, rate.currency)}
          </span>
        )

      case 'carrier':
        return (
          <div>
            <div style={{ color: colors.text.secondary }}>
              {rate.carrier || '-'}
            </div>
            {rate.vesselName && (
              <div style={{ fontSize: 11, color: colors.text.tertiary }}>
                {rate.vesselName}
              </div>
            )}
          </div>
        )

      case 'transitTime':
        return (
          <div>
            <div style={{ color: rate.transitTime ? colors.text.secondary : colors.text.quaternary }}>
              {rate.transitTime ? `${rate.transitTime}天` : '-'}
            </div>
            {rate.schedule && (
              <div style={{ fontSize: 11, color: colors.text.tertiary }}>
                {rate.schedule}
              </div>
            )}
          </div>
        )

      case 'validity':
        return (
          <span style={{ fontSize: 12, color: colors.text.secondary }}>
            {formatDate(rate.validFrom)} ~ {formatDate(rate.validTo)}
          </span>
        )

      case 'spaceStatus':
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
              background: `${getSpaceStatusColor(rate.spaceStatus)}15`,
              color: getSpaceStatusColor(rate.spaceStatus),
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: getSpaceStatusColor(rate.spaceStatus),
              }}
            />
            {getSpaceStatusText(rate.spaceStatus)}
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
              background: `${getStatusColor(rate.status)}15`,
              color: getStatusColor(rate.status),
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: getStatusColor(rate.status),
              }}
            />
            {getStatusText(rate.status)}
          </span>
        )

      case 'actions':
        return (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            <IconButton
              icon={<Edit2 size={14} />}
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/freight-rates/edit/${rate.id}`)}
              title={t('common.edit', '编辑')}
            />
            <IconButton
              icon={<Trash2 size={14} />}
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(rate.id)}
              title={t('common.delete', '删除')}
            />
          </div>
        )

      default:
        return '-'
    }
  }

  // 构建表格列配置
  const tableColumns: Column<FreightRate>[] = useMemo(() => {
    return columns
      .filter((c) => c.visible)
      .map((col) => ({
        key: col.key,
        title: col.label,
        width: col.width,
        align: ['price20GP', 'price40GP', 'price40HQ', 'transitTime', 'spaceStatus', 'status', 'actions'].includes(col.key)
          ? 'center'
          : 'left',
        fixed: col.key === 'actions' ? 'right' : undefined,
        render: (record: FreightRate) => renderCell(record, col.key),
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
      key: 'spaceStatus',
      label: '全部舱位状态',
      options: spaceStatusOptions,
      value: filterSpaceStatus,
      onChange: setFilterSpaceStatus,
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
            {t('freightRates.title', '运价维护')}
          </h1>
          <span style={{ fontSize: 12, color: colors.text.tertiary }}>
            {t('freightRates.subtitle', '管理海运运价信息')}
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
          searchPlaceholder={t('freightRates.searchPlaceholder', '搜索航线、港口、船公司...')}
          filters={filterItems}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          actions={
            <>
              {/* 导入按钮 */}
              <label style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
                <Button variant="secondary" size="md">
                  <Upload size={14} />
                  {t('freightRates.bulkImport', '批量导入')}
                </Button>
              </label>
              {/* 新增按钮 */}
              <Button variant="primary" size="md" onClick={() => navigate('/freight-rates/new')}>
                <Plus size={14} />
                {t('freightRates.newRate', '新增运价')}
              </Button>
            </>
          }
          columnSettings={
            <div style={{ position: 'relative' }}>
              <IconButton
                icon={<Settings size={16} />}
                variant="default"
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
          data={rates}
          loading={loading}
          emptyText={t('freightRates.noData', '暂无运价数据')}
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
