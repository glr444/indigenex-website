import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'
import { colors, spacing, borderRadius, typography, transitions, sizes } from '../../styles/tokens'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** 输入框前缀（图标或文字） */
  prefix?: ReactNode
  /** 输入框后缀 */
  suffix?: ReactNode
  /** 输入框尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否有错误 */
  error?: boolean
}

/**
 * Input - 输入框组件
 *
 * 规范：
 * - 三种尺寸：sm(28px)、md(32px/默认)、lg(40px)
 * - 支持前缀/后缀插槽
 * - focus 时边框变主色
 * - 统一圆角 4px
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    prefix,
    suffix,
    size = 'md',
    error = false,
    disabled,
    style,
    ...props
  }, ref) => {
    // 尺寸样式
    const sizeStyles = {
      sm: { height: sizes.input.sm, padding: `0 ${spacing[2]}`, fontSize: typography.size.sm, prefixWidth: 24 },
      md: { height: sizes.input.DEFAULT, padding: `0 ${spacing[2.5]}`, fontSize: typography.size.DEFAULT, prefixWidth: 28 },
      lg: { height: sizes.input.lg, padding: `0 ${spacing[3]}`, fontSize: typography.size.lg, prefixWidth: 32 },
    }

    const s = sizeStyles[size]
    const hasPrefix = !!prefix
    const hasSuffix = !!suffix

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: s.height,
          borderRadius: borderRadius.DEFAULT,
          border: `1px solid ${error ? colors.danger : colors.border.dark}`,
          background: disabled ? colors.gray[50] : '#fff',
          transition: `border-color ${transitions.DEFAULT}, box-shadow ${transitions.DEFAULT}`,
          overflow: 'hidden',
          ...style,
        }}
        onFocus={(e) => {
          if (!error && !disabled) {
            e.currentTarget.style.borderColor = colors.primary[500]
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.danger : colors.border.dark
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {prefix && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: s.prefixWidth,
              height: '100%',
              color: colors.text.tertiary,
              flexShrink: 0,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          style={{
            flex: 1,
            height: '100%',
            padding: hasPrefix ? `0 ${spacing[1]} 0 0` : s.padding,
            paddingRight: hasSuffix ? spacing[1] : s.padding,
            border: 'none',
            background: 'transparent',
            fontSize: s.fontSize,
            color: disabled ? colors.text.tertiary : colors.text.primary,
            outline: 'none',
          }}
          {...props}
        />
        {suffix && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: `0 ${spacing[2]}`,
              color: colors.text.tertiary,
              flexShrink: 0,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
