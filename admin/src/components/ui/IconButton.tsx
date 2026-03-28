import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { colors, borderRadius, transitions, sizes } from '../../styles/tokens'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 图标 */
  icon: ReactNode
  /** 按钮变体 */
  variant?: 'default' | 'primary' | 'ghost'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否激活状态 */
  active?: boolean
  /** tooltip 提示 */
  title?: string
}

/**
 * IconButton - 图标按钮组件
 *
 * 规范：
 * - 正方形按钮，图标居中
 * - 三种尺寸：sm(28px)、md(32px/默认)、lg(40px)
 * - 支持激活状态样式
 * - 统一圆角 4px
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    variant = 'default',
    size = 'md',
    active = false,
    disabled,
    style,
    ...props
  }, ref) => {
    // 变体样式
    const variantStyles = {
      default: {
        background: active ? 'rgba(0,122,255,0.08)' : '#fff',
        color: active ? colors.primary[500] : colors.gray[400],
        border: `1px solid ${colors.border.dark}`,
        hoverBg: active ? 'rgba(0,122,255,0.12)' : colors.gray[50],
        hoverColor: active ? colors.primary[500] : colors.gray[500],
      },
      primary: {
        background: active ? colors.primary[600] : colors.primary[500],
        color: '#fff',
        border: 'none',
        hoverBg: colors.primary[600],
        hoverColor: '#fff',
      },
      ghost: {
        background: active ? 'rgba(0,0,0,0.04)' : 'transparent',
        color: active ? colors.text.primary : colors.gray[400],
        border: 'none',
        hoverBg: 'rgba(0,0,0,0.04)',
        hoverColor: colors.text.primary,
      },
    }

    // 尺寸样式
    const sizeStyles = {
      sm: { width: sizes.button.sm, height: sizes.button.sm, iconSize: sizes.icon.sm },
      md: { width: sizes.button.DEFAULT, height: sizes.button.DEFAULT, iconSize: sizes.icon.DEFAULT },
      lg: { width: sizes.button.lg, height: sizes.button.lg, iconSize: sizes.icon.lg },
    }

    const v = variantStyles[variant]
    const s = sizeStyles[size]

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s.width,
          height: s.height,
          borderRadius: borderRadius.DEFAULT,
          background: v.background,
          color: v.color,
          border: v.border,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: `all ${transitions.DEFAULT}`,
          padding: 0,
          flexShrink: 0,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = v.hoverBg
            e.currentTarget.style.color = v.hoverColor
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = v.background
          e.currentTarget.style.color = v.color
        }}
        {...props}
      >
        {icon}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
