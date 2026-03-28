import { ButtonHTMLAttributes, forwardRef } from 'react'
import { colors, spacing, borderRadius, typography, transitions, sizes } from '../../styles/tokens'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否加载中 */
  loading?: boolean
  /** 是否块级显示 */
  block?: boolean
}

/**
 * Button - 按钮组件
 *
 * 规范：
 * - 四种变体：primary(主按钮)、secondary(次按钮)、ghost(幽灵按钮)、danger(危险按钮)
 * - 三种尺寸：sm(小)、md(中/默认)、lg(大)
 * - 统一圆角 4px
 * - 点击动效 0.15s
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    disabled,
    style,
    children,
    ...props
  }, ref) => {
    // 变体样式
    const variantStyles = {
      primary: {
        background: colors.primary[500],
        color: '#fff',
        border: 'none',
        hoverBg: colors.primary[600],
      },
      secondary: {
        background: '#fff',
        color: colors.text.secondary,
        border: `1px solid ${colors.border.dark}`,
        hoverBg: colors.gray[50],
      },
      ghost: {
        background: 'transparent',
        color: colors.text.secondary,
        border: 'none',
        hoverBg: 'rgba(0,0,0,0.04)',
      },
      danger: {
        background: colors.danger,
        color: '#fff',
        border: 'none',
        hoverBg: '#D70015',
      },
    }

    // 尺寸样式
    const sizeStyles = {
      sm: { height: sizes.button.sm, padding: `${spacing[1]} ${spacing[3]}`, fontSize: typography.size.sm },
      md: { height: sizes.button.DEFAULT, padding: `${spacing[1.5]} ${spacing[4]}`, fontSize: typography.size.DEFAULT },
      lg: { height: sizes.button.lg, padding: `${spacing[2]} ${spacing[5]}`, fontSize: typography.size.lg },
    }

    const v = variantStyles[variant]
    const s = sizeStyles[size]

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[1],
          height: s.height,
          padding: s.padding,
          borderRadius: borderRadius.DEFAULT,
          fontSize: s.fontSize,
          fontWeight: typography.weight.medium,
          background: v.background,
          color: v.color,
          border: v.border,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.6 : 1,
          transition: `all ${transitions.DEFAULT}`,
          width: block ? '100%' : 'auto',
          whiteSpace: 'nowrap',
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.background = v.hoverBg
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = v.background
        }}
        {...props}
      >
        {loading && (
          <span style={{
            width: parseInt(s.fontSize) - 2,
            height: parseInt(s.fontSize) - 2,
            border: `2px solid rgba(255,255,255,0.3)`,
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 添加旋转动画
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)
