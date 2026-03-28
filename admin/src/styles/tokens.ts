/**
 * Design Tokens - 设计令牌
 * 整个系统的设计规范源头，一处修改全局生效
 */

// 颜色系统
export const colors = {
  // 主色调
  primary: {
    50: '#E6F2FF',
    100: '#CCE5FF',
    200: '#99CBFF',
    300: '#66B0FF',
    400: '#3396FF',
    500: '#007AFF',  // 主色
    600: '#0062CC',
    700: '#004999',
    800: '#003166',
    900: '#001833',
  },
  // 状态色
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#007AFF',
  // 中性色
  gray: {
    50: '#F5F5F7',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#8E8E93',
    500: '#86868B',
    600: '#636366',
    700: '#3A3A3C',
    800: '#2C2C2E',
    900: '#1D1D1F',
  },
  // 背景色
  bg: {
    primary: '#FFFFFF',
    secondary: '#F5F5F7',
    tertiary: '#FAFAFA',
  },
  // 文字色
  text: {
    primary: '#1D1D1F',
    secondary: '#3A3A3C',
    tertiary: '#86868B',
    quaternary: '#C7C7CC',
  },
  // 边框色
  border: {
    light: 'rgba(0,0,0,0.04)',
    DEFAULT: 'rgba(0,0,0,0.06)',
    dark: 'rgba(0,0,0,0.08)',
  },
} as const

// 间距系统（基于 4px 网格）
export const spacing = {
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
} as const

// 圆角系统
export const borderRadius = {
  none: '0',
  sm: '2px',
  DEFAULT: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const

// 字体系统
export const typography = {
  // 字体大小
  size: {
    xs: '11px',
    sm: '12px',
    DEFAULT: '13px',
    lg: '14px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '20px',
  },
  // 字重
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // 行高
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

// 阴影系统
export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  DEFAULT: '0 2px 8px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 4px 20px rgba(0,0,0,0.15)',
  xl: '0 8px 32px rgba(0,0,0,0.12)',
} as const

// 过渡动画
export const transitions = {
  fast: '0.1s ease',
  DEFAULT: '0.15s ease',
  slow: '0.2s ease',
} as const

// Z-index 层级
export const zIndex = {
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
} as const

// 组件尺寸规范
export const sizes = {
  // 按钮高度
  button: {
    sm: '28px',
    DEFAULT: '32px',
    lg: '40px',
  },
  // 输入框高度
  input: {
    sm: '28px',
    DEFAULT: '32px',
    lg: '40px',
  },
  // 图标尺寸
  icon: {
    xs: 12,
    sm: 14,
    DEFAULT: 16,
    lg: 20,
    xl: 24,
  },
} as const
