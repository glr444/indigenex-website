import { ReactNode } from 'react'
import { colors, spacing, borderRadius, shadows } from '../../styles/tokens'

export interface CardProps {
  /** 卡片内容 */
  children: ReactNode
  /** 是否有内边距 */
  padding?: boolean
  /** 是否有边框 */
  bordered?: boolean
  /** 是否有阴影 */
  shadow?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 标题 */
  title?: ReactNode
  /** 标题右侧操作 */
  extra?: ReactNode
}

/**
 * Card - 卡片容器组件
 *
 * 规范：
 * - 统一圆角 4px
 * - 默认白色背景
 * - 可选边框和阴影
 */
export function Card({
  children,
  padding = true,
  bordered = true,
  shadow = false,
  style,
  title,
  extra,
}: CardProps) {
  return (
    <div
      style={{
        background: colors.bg.primary,
        borderRadius: borderRadius.DEFAULT,
        border: bordered ? `1px solid ${colors.border.DEFAULT}` : 'none',
        boxShadow: shadow ? shadows.DEFAULT : 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || extra) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing[3]} ${spacing[4]}`,
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          {title && (
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.primary }}>
              {title}
            </span>
          )}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={{ padding: padding ? spacing[4] : 0 }}>{children}</div>
    </div>
  )
}
