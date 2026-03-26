import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: string
  label: string
  searchText?: string
}

interface AutocompleteProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: Option[]
  placeholder?: string
  required?: boolean
  loading?: boolean
  defaultLimit?: number
}

export default function Autocomplete({
  label,
  value,
  onChange,
  options,
  placeholder = '请选择或输入',
  required = false,
  loading = false,
  defaultLimit = 10
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 获取选中的选项
  const selectedOption = options.find(opt => opt.value === value)

  // 初始化输入值
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label)
    } else {
      setInputValue(value || '')
    }
  }, [value, selectedOption])

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // 根据输入过滤选项
    if (newValue.trim()) {
      const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(newValue.toLowerCase()) ||
        opt.value.toLowerCase().includes(newValue.toLowerCase()) ||
        (opt.searchText && opt.searchText.toLowerCase().includes(newValue.toLowerCase()))
      )
      setFilteredOptions(filtered)
    } else {
      // 无输入时只显示前10条
      setFilteredOptions(options.slice(0, defaultLimit))
    }
  }

  // 处理焦点 - 显示默认10条
  const handleFocus = () => {
    setIsOpen(true)
    if (!inputValue.trim()) {
      setFilteredOptions(options.slice(0, defaultLimit))
    } else {
      // 如果有输入值，根据输入过滤
      const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        opt.value.toLowerCase().includes(inputValue.toLowerCase()) ||
        (opt.searchText && opt.searchText.toLowerCase().includes(inputValue.toLowerCase()))
      )
      setFilteredOptions(filtered)
    }
  }

  // 选择选项
  const handleSelect = (option: Option) => {
    onChange(option.value)
    setInputValue(option.label)
    setIsOpen(false)
  }

  // 清空选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setInputValue('')
    setFilteredOptions(options.slice(0, defaultLimit))
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: '#FF3B30' }}> *</span>}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          style={{
            ...inputStyle,
            paddingRight: 40
          }}
        />

        {/* 清空按钮或下拉箭头 */}
        <div style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: 2,
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#86868B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen)
              if (!isOpen) {
                inputRef.current?.focus()
                handleFocus()
              }
            }}
            style={{
              padding: 2,
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#86868B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* 下拉选项列表 */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          maxHeight: 240,
          overflow: 'auto',
          background: '#fff',
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          zIndex: 1000
        }}>
          {loading ? (
            <div style={{
              padding: '12px 16px',
              color: '#86868B',
              fontSize: 13,
              textAlign: 'center'
            }}>
              加载中...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div style={{
              padding: '12px 16px',
              color: '#86868B',
              fontSize: 13,
              textAlign: 'center'
            }}>
              无匹配数据
            </div>
          ) : (
            <>
              {filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    borderBottom: index < filteredOptions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    background: option.value === value ? 'rgba(0,122,255,0.08)' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13,
                    color: option.value === value ? '#007AFF' : '#1D1D1F',
                    fontWeight: option.value === value ? 500 : 400,
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (option.value !== value) {
                      e.currentTarget.style.background = '#F5F5F7'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (option.value !== value) {
                      e.currentTarget.style.background = '#fff'
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
              {!inputValue.trim() && options.length > defaultLimit && (
                <div style={{
                  padding: '8px 16px',
                  color: '#86868B',
                  fontSize: 11,
                  textAlign: 'center',
                  borderTop: '1px solid rgba(0,0,0,0.04)',
                  background: '#FAFAFA'
                }}>
                  共 {options.length} 条，请输入搜索更多
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#3A3A3C',
  marginBottom: 4
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.08)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
  background: '#fff'
}
