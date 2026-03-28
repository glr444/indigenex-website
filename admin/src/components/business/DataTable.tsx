import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { colors, spacing, typography } from '../../styles/tokens'
import { Button } from '../ui/Button'

export interface Column<T> {
  /** 列标识 */
  key: string
  /** 列标题 */
  title: string
  /** 列宽 */
  width?: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否固定在右侧 */
  fixed?: 'right'
  /** 自定义渲染 */
  render?: (record: T) => ReactNode
}

export interface DataTableProps<T> {
  /** 表格列配置 */
  columns: Column<T>[]
  /** 表格数据 */
  data: T[]
  /** 加载状态 */
  loading?: boolean
  /** 空状态提示 */
  emptyText?: string
  /** 行唯一标识 */
  rowKey: keyof T
  /** 当前页 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 总记录数 */
  totalCount: number
  /** 每页条数 */
  pageSize: number
  /** 页码变化回调 */
  onPageChange: (page: number) => void
  /** 每页条数变化回调 */
  onPageSizeChange: (size: number) => void
}

const thStyle: React.CSSProperties = {
  padding: `${spacing[2]} ${spacing[2.5]}`,
  textAlign: 'left',
  fontSize: typography.size.xs,
  fontWeight: typography.weight.semibold,
  color: colors.text.tertiary,
  whiteSpace: 'nowrap',
  background: colors.bg.secondary,
}

const tdStyle: React.CSSProperties = {
  padding: `${spacing[2]} ${spacing[2.5]}`,
  fontSize: typography.size.sm,
  color: colors.text.primary,
  whiteSpace: 'nowrap',
}

/**
 * DataTable - 数据表格组件
 *
 * 规范：
 * - 统一表头样式（灰色背景、小字、半粗）
 * - 支持固定列（右侧操作列）
 * - 内置分页器
 * - 行 hover 效果
 */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyText = '暂无数据',
  rowKey,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const showPagination = totalPages > 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 表格区域 */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...thStyle,
                    width: col.width,
                    textAlign: col.align || 'left',
                    position: col.fixed === 'right' ? 'relative' : undefined,
                  }}
                >
                  {col.fixed === 'right' && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '60%',
                        background: colors.gray[200],
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}
                  <span style={{ paddingLeft: col.fixed === 'right' ? spacing[2] : 0 }}>
                    {col.title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: spacing[10], textAlign: 'center' }}
                >
                  <span style={{ color: colors.text.tertiary, fontSize: typography.size.sm }}>
                    加载中...
                  </span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: spacing[10], textAlign: 'center' }}
                >
                  <span style={{ color: colors.text.tertiary, fontSize: typography.size.sm }}>
                    {emptyText}
                  </span>
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr
                  key={String(record[rowKey])}
                  style={{
                    borderBottom: `1px solid ${colors.border.light}`,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.bg.tertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        ...tdStyle,
                        textAlign: col.align || 'left',
                        position: col.fixed === 'right' ? 'relative' : undefined,
                      }}
                    >
                      {col.fixed === 'right' && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: '60%',
                            background: colors.gray[200],
                            borderRadius: '0 2px 2px 0',
                          }}
                        />
                      )}
                      <div
                        style={{
                          paddingLeft: col.fixed === 'right' ? spacing[2] : 0,
                          display: 'flex',
                          justifyContent:
                            col.align === 'center'
                              ? 'center'
                              : col.align === 'right'
                              ? 'flex-end'
                              : 'flex-start',
                        }}
                      >
                        {col.render
                          ? col.render(record)
                          : String((record as Record<string, unknown>)[col.key] ?? '-')
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页器 */}
      {showPagination && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing[3],
            padding: `${spacing[2]} ${spacing[3]}`,
            background: colors.bg.primary,
            borderRadius: 4,
            border: `1px solid ${colors.border.DEFAULT}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: typography.size.sm, color: colors.text.tertiary }}>
            共 {totalCount} 条，每页
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                margin: `0 ${spacing[1.5]}`,
                padding: `${spacing[0.5]} ${spacing[1]}`,
                borderRadius: 4,
                border: `1px solid ${colors.border.dark}`,
                fontSize: typography.size.sm,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            条，第 {currentPage}/{totalPages} 页
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              首页
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </Button>

            {getPageNumbers().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                style={{
                  minWidth: 24,
                  height: 24,
                  padding: '0 4px',
                  borderRadius: 4,
                  border: 'none',
                  background: page === currentPage ? colors.primary[500] : colors.bg.secondary,
                  color:
                    page === currentPage
                      ? '#fff'
                      : page === '...'
                      ? colors.text.tertiary
                      : colors.text.secondary,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                  cursor: page === '...' ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {page}
              </button>
            ))}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              末页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
