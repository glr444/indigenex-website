import { ReactNode } from 'react'
import { Search, Filter } from 'lucide-react'
import { colors, spacing } from '../../styles/tokens'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export interface FilterItem {
  /** 筛选键 */
  key: string
  /** 筛选标签 */
  label: string
  /** 筛选项 */
  options: { value: string; label: string }[]
  /** 当前值 */
  value: string
  /** 值变化回调 */
  onChange: (value: string) => void
}

export interface SearchBarProps {
  /** 搜索关键词 */
  searchValue: string
  /** 搜索变化回调 */
  onSearchChange: (value: string) => void
  /** 搜索占位符 */
  searchPlaceholder?: string
  /** 筛选配置 */
  filters?: FilterItem[]
  /** 是否显示筛选 */
  showFilters?: boolean
  /** 切换筛选显示 */
  onToggleFilters?: () => void
  /** 右侧操作按钮 */
  actions?: ReactNode
  /** 列设置按钮 */
  columnSettings?: ReactNode
}

/**
 * SearchBar - 搜索筛选栏组件
 *
 * 规范：
 * - 左侧：列设置按钮 + 搜索框
 * - 中间：筛选切换按钮
 * - 右侧：操作按钮组
 * - 筛选展开在下方
 */
export function SearchBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索...',
  filters = [],
  showFilters = false,
  onToggleFilters,
  actions,
  columnSettings,
}: SearchBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[2],
      }}
    >
      {/* 第一行：搜索 + 筛选按钮 + 操作 */}
      <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
        {/* 列设置 */}
        {columnSettings}

        {/* 搜索框 */}
        <div style={{ flex: 1 }}>
          <Input
            prefix={<Search size={14} color={colors.text.tertiary} />}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* 筛选按钮 */}
        {filters.length > 0 && onToggleFilters && (
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            onClick={onToggleFilters}
          >
            <Filter size={14} />
            筛选
          </Button>
        )}

        {/* 操作按钮组 */}
        {actions && (
          <div style={{ display: 'flex', gap: spacing[2] }}>
            {actions}
          </div>
        )}
      </div>

      {/* 筛选展开区 */}
      {showFilters && filters.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            paddingTop: spacing[2],
            borderTop: `1px solid ${colors.border.light}`,
          }}
        >
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: 4,
                border: `1px solid ${colors.border.dark}`,
                fontSize: 12,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  )
}
